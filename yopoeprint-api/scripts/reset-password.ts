/**
 * Réinitialise le mot de passe d'un compte YopoePrint (table public.users), sans email.
 * Pour l'exploitation : quand l'envoi d'emails n'est pas configuré ou qu'un administrateur
 * a perdu son accès. Le mot de passe est saisi de façon masquée, chiffré en bcrypt (coût 12,
 * comme l'API), et toutes les sessions ouvertes du compte sont fermées.
 *
 * Usage (depuis yopoeprint-api, avec les variables DB_* du .env) :
 *   npm run user:reset-password
 *   npm run user:reset-password -- prenom@exemple.bf
 */
import 'dotenv/config'
import * as readline from 'readline'
import * as bcrypt from 'bcryptjs'
import { Client } from 'pg'

const MIN_LENGTH = 8 // même règle que l'inscription

// Lecture ligne à ligne : saisie masquée au terminal, entrée standard sinon (tests, automatisation)
function createPrompter() {
  const interactive = !!process.stdin.isTTY
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: interactive })
  const lines: string[] = []
  const waiters: Array<(line: string | null) => void> = []
  let closed = false
  rl.on('line', (line) => (waiters.length ? waiters.shift()!(line) : lines.push(line)))
  rl.on('close', () => { closed = true; while (waiters.length) waiters.shift()!(null) })

  const next = () => new Promise<string | null>((resolve) => {
    if (lines.length) return resolve(lines.shift()!)
    if (closed) return resolve(null)
    waiters.push(resolve)
  })

  return {
    async ask(question: string, hidden = false): Promise<string> {
      process.stdout.write(question)
      const write = (rl as any)._writeToOutput
      if (hidden && interactive) (rl as any)._writeToOutput = () => undefined // rien ne s'affiche pendant la frappe
      const answer = await next()
      if (hidden && interactive) { (rl as any)._writeToOutput = write; process.stdout.write('\n') }
      if (answer === null) throw new Error('Saisie interrompue')
      return answer.trim()
    },
    close: () => rl.close(),
  }
}

async function main() {
  const prompt = createPrompter()
  const db = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  })

  try {
    const email = process.argv[2]?.trim() || await prompt.ask('Email du compte : ')
    await db.connect()
    const { rows } = await db.query(
      'SELECT id, first_name, last_name, role, is_active FROM public.users WHERE LOWER(email) = LOWER($1)',
      [email],
    )
    if (!rows.length) {
      console.error(`Aucun compte YopoePrint pour « ${email} » (table public.users).`)
      console.error('Un compte créé dans Supabase › Authentication n\'est pas utilisé par l\'application.')
      process.exitCode = 1
      return
    }
    const user = rows[0]
    console.log(`Compte : ${user.first_name} ${user.last_name} — rôle ${user.role}${user.is_active ? '' : ' (DÉSACTIVÉ)'}`)

    const password = await prompt.ask(`Nouveau mot de passe (${MIN_LENGTH} caractères minimum) : `, true)
    if (password.length < MIN_LENGTH) throw new Error(`Mot de passe trop court (${MIN_LENGTH} caractères minimum)`)
    if (password.length > 100) throw new Error('Mot de passe trop long (100 caractères maximum)')
    const confirm = await prompt.ask('Confirmer le mot de passe : ', true)
    if (confirm !== password) throw new Error('Les deux saisies ne correspondent pas')

    const hash = await bcrypt.hash(password, 12)
    await db.query('BEGIN')
    await db.query(
      `UPDATE public.users
         SET password_hash = $2, password_reset_token_hash = NULL, password_reset_expires_at = NULL, updated_at = now()
       WHERE id = $1`,
      [user.id, hash],
    )
    // Table absente sur une base antérieure aux sessions multiples : rien à fermer
    const sessions = await db.query(
      `SELECT to_regclass('public.user_sessions') IS NOT NULL AS ok`,
    )
    let closed = 0
    if (sessions.rows[0].ok) closed = (await db.query('DELETE FROM public.user_sessions WHERE user_id = $1', [user.id])).rowCount ?? 0
    await db.query('COMMIT')

    console.log(`Mot de passe modifié. Sessions fermées : ${closed}.`)
    if (!user.is_active) console.log('Attention : ce compte est désactivé, la connexion restera refusée tant qu\'il n\'est pas réactivé.')
  } catch (e: any) {
    await db.query('ROLLBACK').catch(() => undefined)
    console.error(`Échec : ${e?.message || e}`)
    process.exitCode = 1
  } finally {
    prompt.close()
    await db.end().catch(() => undefined)
  }
}

main()
