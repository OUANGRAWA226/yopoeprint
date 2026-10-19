import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resend } from 'resend';
import { EmailLog } from './email-log.entity';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private isConfigured = false;

  constructor(@InjectRepository(EmailLog) private logs: Repository<EmailLog>) {
    // En développement local sans clé, on log juste les emails
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
    } else {
      this.logger.warn('RESEND_API_KEY non définie. Les emails seront simulés dans la console.');
    }
  }

  async sendOrderConfirmation(email: string, orderNumber: string, total: number) {
    const subject = `Confirmation de commande ${orderNumber} - YopoePrint`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: white; padding: 40px; border-radius: 12px;">
        <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px;">Merci pour votre commande ! 🎉</h1>
        <p style="color: #9ca3af; font-size: 16px; line-height: 1.5;">Votre commande <strong>${orderNumber}</strong> a bien été enregistrée et sera bientôt traitée par notre équipe.</p>
        
        <div style="background-color: #1f2937; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #d1d5db;">Montant total</h2>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">${new Intl.NumberFormat('fr-FR').format(total)} FCFA</p>
        </div>

        <p style="color: #9ca3af; font-size: 14px; margin-bottom: 30px;">
          Vous pouvez suivre l'avancement de votre commande en temps réel sur notre site :
        </p>
        
        <a href="https://yopoeprint.com/suivi?ref=${orderNumber}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Suivre ma commande
        </a>
      </div>
    `;

    return this.sendMail(email, subject, html, 'orderConfirmation');
  }

  async sendOrderStatusUpdate(email: string, orderNumber: string, status: string) {
    let statusText = '';
    let message = '';
    
    switch (status) {
      case 'in_production':
        statusText = 'En cours d\'impression 🖨️';
        message = 'Bonne nouvelle ! Vos fichiers sont actuellement en cours d\'impression dans nos ateliers.';
        break;
      case 'ready':
        statusText = 'Prête pour la livraison 📦';
        message = 'Votre commande est terminée ! Elle a été emballée et est prête à vous être expédiée.';
        break;
      case 'shipped':
        statusText = 'En route 🚚';
        message = 'Votre commande a été remise à notre livreur et est en route vers vous.';
        break;
      case 'delivered':
        statusText = 'Livrée ✅';
        message = 'Votre commande a été livrée. Nous espérons que vous êtes satisfait de la qualité !';
        break;
      default:
        statusText = 'Mise à jour';
        message = 'Le statut de votre commande a été mis à jour.';
    }

    const subject = `Mise à jour de votre commande ${orderNumber} - YopoePrint`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h1 style="color: #111827; font-size: 20px; margin-bottom: 16px;">Mise à jour de statut</h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Votre commande <strong>${orderNumber}</strong> est maintenant :</p>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #111827;">${statusText}</p>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
          ${message}
        </p>

        <a href="https://yopoeprint.com/suivi?ref=${orderNumber}" style="display: inline-block; background-color: #111827; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">
          Suivre ma commande
        </a>
      </div>
    `;

    return this.sendMail(email, subject, html, 'orderStatusUpdate');
  }

  async sendBatReadyEmail(email: string, orderNumber: string, batNotes?: string) {
    const subject = `🎨 Action requise : Bon À Tirer (BAT) prêt pour la commande ${orderNumber} - YopoePrint`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: white; padding: 40px; border-radius: 12px;">
        <h1 style="color: #ffffff; font-size: 22px; margin-bottom: 8px;">Votre Bon À Tirer (BAT) est disponible ! 🎨</h1>
        <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
          Notre équipe pré-presse a préparé votre épreuve numérique pour la commande <strong>${orderNumber}</strong>.
        </p>

        ${batNotes ? `
        <div style="background-color: #1f2937; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #9ca3af; font-weight: bold;">Note de notre studio graphique :</p>
          <p style="margin: 0; font-size: 14px; color: #ffffff;">${batNotes}</p>
        </div>
        ` : ''}

        <p style="color: #9ca3af; font-size: 14px; margin: 24px 0;">
          Merci de vérifier attentivement le cadrage, les marges de coupe et les textes sur notre visualiseur interactif avant de confirmer pour impression.
        </p>

        <a href="https://yopoeprint.com/suivi?ref=${orderNumber}" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 15px;">
          Examiner et Valider mon BAT en ligne →
        </a>
      </div>
    `;
    return this.sendMail(email, subject, html, 'batReady');
  }

  async sendBatApprovedEmail(email: string, orderNumber: string) {
    const subject = `✅ BAT Validé ! Commande ${orderNumber} lancée en impression`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h1 style="color: #111827; font-size: 20px; margin-bottom: 12px;">BAT confirmé avec succès 🎉</h1>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
          Votre validation pour la commande <strong>${orderNumber}</strong> a bien été enregistrée. Vos fichiers ont été transmis à nos presses d'impression.
        </p>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: bold;">Statut : En cours de production 🖨️</p>
        </div>
        <a href="https://yopoeprint.com/suivi?ref=${orderNumber}" style="display: inline-block; background-color: #111827; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">
          Suivre l'impression
        </a>
      </div>
    `;
    return this.sendMail(email, subject, html, 'batApproved');
  }

  async sendBatRejectedEmail(email: string, orderNumber: string, reason: string) {
    const subject = `🛠️ Demande de correction reçue pour le BAT ${orderNumber}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h1 style="color: #111827; font-size: 20px; margin-bottom: 12px;">Corrections demandées bien reçues</h1>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
          Vous avez demandé des corrections pour le BAT de la commande <strong>${orderNumber}</strong> :
        </p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #991b1b;">"${reason}"</p>
        </div>
        <p style="color: #4b5563; font-size: 14px;">
          Notre équipe graphique ajuste vos fichiers et vous soumettra une nouvelle version du BAT sous 24h ouvrées.
        </p>
      </div>
    `;
    return this.sendMail(email, subject, html, 'batRejected');
  }
  async sendQuoteReceived(email: string, fullName: string, reference: string, product: string) {
    const subject = `Demande de devis ${reference} bien reçue - YopoePrint`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h1 style="color: #111827; font-size: 20px; margin-bottom: 12px;">Merci ${escapeHtml(fullName)} !</h1>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
          Votre demande de devis <strong>${escapeHtml(reference)}</strong> (${escapeHtml(product)}) a bien été transmise à notre atelier.
        </p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
          Vous recevrez une proposition chiffrée sous 24h ouvrées.
        </p>
      </div>
    `;
    return this.sendMail(email, subject, html, 'quoteReceived');
  }

  async sendQuoteProposal(email: string, fullName: string, reference: string, price: number) {
    const subject = `Votre devis ${reference} est prêt - YopoePrint`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: white; padding: 40px; border-radius: 12px;">
        <h1 style="color: #ffffff; font-size: 22px; margin-bottom: 8px;">Bonjour ${escapeHtml(fullName)},</h1>
        <p style="color: #9ca3af; font-size: 15px; line-height: 1.6;">
          Notre atelier a chiffré votre demande <strong>${escapeHtml(reference)}</strong>.
        </p>
        <div style="background-color: #1f2937; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #d1d5db;">Montant proposé</h2>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">${new Intl.NumberFormat('fr-FR').format(price)} FCFA</p>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">
          Retrouvez le détail dans votre espace client, rubrique « Mes devis », ou répondez à cet email pour en discuter.
        </p>
      </div>
    `;
    return this.sendMail(email, subject, html, 'quoteProposal');
  }

  async sendResellerApplicationReceived(email: string, firstName: string, companyName: string) {
    const subject = 'Votre demande de compte revendeur - YopoePrint';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h1 style="color: #111827; font-size: 20px; margin-bottom: 12px;">Bonjour ${escapeHtml(firstName)},</h1>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
          Nous avons bien reçu la demande de compte revendeur pour <strong>${escapeHtml(companyName)}</strong>.
          Notre équipe l'examine et vous répond sous 24 h ouvrées.
        </p>
      </div>
    `;
    return this.sendMail(email, subject, html, 'resellerApplicationReceived');
  }

  async sendResellerApproved(email: string, firstName: string, companyName: string, rate: number) {
    const subject = 'Votre compte revendeur est activé - YopoePrint';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: white; padding: 40px; border-radius: 12px;">
        <h1 style="color: #ffffff; font-size: 22px; margin-bottom: 8px;">Bienvenue dans le programme revendeur, ${escapeHtml(firstName)} !</h1>
        <p style="color: #d1d5db; font-size: 15px; line-height: 1.6;">
          Le compte de <strong>${escapeHtml(companyName)}</strong> est actif : une remise de <strong>${rate} %</strong>
          s'applique désormais automatiquement à toutes vos commandes, et la livraison en marque blanche est disponible
          dès que vous avez renseigné votre identité d'expéditeur.
        </p>
        <p style="color: #d1d5db; font-size: 14px;">Retrouvez vos économies et votre palier dans votre espace revendeur.</p>
      </div>
    `;
    return this.sendMail(email, subject, html, 'resellerApproved');
  }

  async sendPasswordReset(email: string, firstName: string, resetUrl: string) {
    const subject = 'Réinitialisation de votre mot de passe - YopoePrint';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h1 style="color: #111827; font-size: 20px; margin-bottom: 12px;">Bonjour ${escapeHtml(firstName)},</h1>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
          Vous avez demandé à réinitialiser le mot de passe de votre compte YopoePrint. Ce lien est valable <strong>1 heure</strong> et ne peut servir qu'une fois.
        </p>
        <a href="${escapeHtml(resetUrl)}" style="display: inline-block; background-color: #111827; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: bold; font-size: 15px; margin: 24px 0;">
          Choisir un nouveau mot de passe
        </a>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
          Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : votre mot de passe actuel reste inchangé.
        </p>
      </div>
    `;
    return this.sendMail(email, subject, html, 'passwordReset');
  }

  private async sendMail(to: string, subject: string, html: string, template = 'autre') {
    if (!this.isConfigured) {
      this.logger.log(`[Simulation Email] À: ${to} | Sujet: ${subject}`);
      await this.record(to, subject, template, 'simulated');
      return { id: 'simulated-email-id' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'YopoePrint <hello@yopoeprint.com>', // Nécessite un domaine vérifié sur Resend
        to,
        subject,
        html,
      });
      if (error) {
        this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
        await this.record(to, subject, template, 'failed', null, error.message);
        return null;
      }
      this.logger.log(`Email envoyé avec succès: ${data?.id}`);
      await this.record(to, subject, template, 'sent', data?.id ?? null);
      return data;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error?.message || error}`);
      await this.record(to, subject, template, 'failed', null, String(error?.message || error));
      // On ne throw pas l'erreur pour ne pas bloquer le flux principal
      return null;
    }
  }

  // Journal des envois (admin › Emails) ; une erreur d'écriture ne doit jamais bloquer l'envoi
  private async record(to: string, subject: string, template: string, status: 'sent' | 'failed' | 'simulated', providerId: string | null = null, error: string | null = null) {
    try {
      await this.logs.insert({ toEmail: to, subject: subject.slice(0, 200), template, status, providerId, error: error ? error.slice(0, 300) : null });
    } catch (e: any) {
      this.logger.error(`Journal des emails : ${e?.message || e}`);
    }
  }
}

// Les champs saisis par les clients (nom, produit…) sont injectés dans du HTML
function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
