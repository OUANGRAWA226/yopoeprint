'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Users, ShieldCheck } from 'lucide-react'
import { adminAuthService } from '@/lib/auth-admin.service'
import { platformService, TeamMember, Role, ROLE_LABELS, ROLE_HINTS } from '@/lib/platform.service'
import { Card, ErrorAlert, LoadingRow, Modal, Spinner, TableMessage } from '@/components/ui'
import { dateFr } from '@/components/status'

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', password: '', role: 'staff' as Role }
const ROLE_BADGE: Record<string, string> = { superadmin: 'text-bg-danger', admin: 'text-bg-primary', staff: 'text-bg-info' }

export default function EquipePage() {
  const me = adminAuthService.getCurrentUser()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setMembers(await platformService.listTeam())
      setError('')
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger l\'équipe')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const closeForm = useCallback(() => { setShowForm(false); setFormError('') }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setFormError('')
    try {
      await platformService.createMember({ ...form, phone: form.phone || undefined })
      setForm(EMPTY)
      setShowForm(false)
      await load()
    } catch (err: any) {
      setFormError(err?.message || 'Création impossible')
    } finally {
      setCreating(false)
    }
  }

  const act = async (id: string, fn: () => Promise<unknown>, confirmText: string) => {
    if (!window.confirm(confirmText)) return
    setBusyId(id)
    setError('')
    try {
      await fn()
      await load()
    } catch (err: any) {
      setError(err?.message || 'Action impossible')
    } finally {
      setBusyId(null)
    }
  }

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value })
  const active = members.filter((m) => m.isActive).length

  return (
    <>
      <ErrorAlert message={error} onRetry={load} />

      <div className="row">
        <div className="col-lg-8">
          <Card title="Membres de l'équipe" icon={<Users size={18} />} noPadding
            tools={
              <button type="button" onClick={() => setShowForm(true)} className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1">
                <UserPlus size={15} /> Ajouter un membre
              </button>
            }
            footer={<small className="text-secondary">{active} compte(s) actif(s) sur {members.length}</small>}>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead>
                  <tr><th>Membre</th><th>Rôle</th><th>Statut</th><th>Depuis</th><th className="text-end">Actions</th></tr>
                </thead>
                <tbody>
                  {loading ? <LoadingRow colSpan={5} /> : members.length === 0 ? (
                    <TableMessage colSpan={5}>Aucun membre.</TableMessage>
                  ) : members.map((m) => {
                    const isMe = m.id === me?.id
                    return (
                      <tr key={m.id} className={m.isActive ? '' : 'opacity-50'}>
                        <td>
                          <div className="fw-semibold">
                            {m.firstName} {m.lastName}
                            {isMe && <span className="badge text-bg-light ms-1 fw-normal">vous</span>}
                          </div>
                          <small className="text-secondary">{m.email}</small>
                        </td>
                        <td style={{ minWidth: 190 }}>
                          {isMe ? (
                            <span className={`badge ${ROLE_BADGE[m.role] || 'text-bg-secondary'}`}>{ROLE_LABELS[m.role]}</span>
                          ) : (
                            <select value={m.role} disabled={busyId === m.id} aria-label={`Rôle de ${m.firstName}`}
                              className="form-select form-select-sm"
                              onChange={(e) => {
                                const role = e.target.value as Role | 'client'
                                act(m.id, () => platformService.setRole(m.id, role),
                                  role === 'client' ? `Retirer ${m.firstName} de l'équipe ? Son compte redevient un compte client.` : `Passer ${m.firstName} en « ${ROLE_LABELS[role]} » ?`)
                              }}>
                              {(Object.keys(ROLE_HINTS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                              <option value="client">Retirer de l&apos;équipe</option>
                            </select>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${m.isActive ? 'text-bg-success' : 'text-bg-secondary'}`}>{m.isActive ? 'Actif' : 'Désactivé'}</span>
                        </td>
                        <td className="small text-secondary text-nowrap">{dateFr(m.createdAt)}</td>
                        <td className="text-end text-nowrap">
                          {!isMe && (
                            <button type="button" disabled={busyId === m.id}
                              onClick={() => act(m.id, () => platformService.setActive(m.id, !m.isActive),
                                m.isActive ? `Désactiver le compte de ${m.firstName} ? Ses sessions seront coupées.` : `Réactiver le compte de ${m.firstName} ?`)}
                              className={`btn btn-sm ${m.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}>
                              {busyId === m.id ? <Spinner /> : m.isActive ? 'Désactiver' : 'Réactiver'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card title="Rôles" icon={<ShieldCheck size={18} />} variant="gold">
            <dl className="mb-0">
              {(Object.keys(ROLE_HINTS) as Role[]).map((r) => (
                <div key={r} className="mb-3">
                  <dt><span className={`badge ${ROLE_BADGE[r]}`}>{ROLE_LABELS[r]}</span></dt>
                  <dd className="small text-secondary mb-0 mt-1">{ROLE_HINTS[r]}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      <Modal open={showForm} title="Ajouter un membre" onClose={closeForm}
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={closeForm}>Annuler</button>
            <button type="submit" form="member-form" disabled={creating} className="btn btn-primary d-inline-flex align-items-center gap-2">
              {creating && <Spinner />} Créer le compte
            </button>
          </>
        }>
        <form id="member-form" onSubmit={create}>
          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="m-first">Prénom *</label>
              <input id="m-first" required className="form-control" value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="m-last">Nom *</label>
              <input id="m-last" required className="form-control" value={form.lastName} onChange={set('lastName')} />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="m-email">Email *</label>
              <input id="m-email" required type="email" className="form-control" value={form.email} onChange={set('email')} />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="m-phone">Téléphone</label>
              <input id="m-phone" type="tel" className="form-control" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="m-pass">Mot de passe provisoire *</label>
              <input id="m-pass" required minLength={10} type="password" autoComplete="new-password" className="form-control"
                value={form.password} onChange={set('password')} aria-describedby="m-pass-help" />
              <div id="m-pass-help" className="form-text">10 caractères minimum.</div>
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="m-role">Rôle *</label>
              <select id="m-role" className="form-select" value={form.role} onChange={set('role')}>
                {(Object.keys(ROLE_HINTS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <div className="form-text">{ROLE_HINTS[form.role]}</div>
            </div>
          </div>
          {formError && <div role="alert" className="alert alert-danger mt-3 mb-0 py-2">{formError}</div>}
        </form>
      </Modal>
    </>
  )
}
