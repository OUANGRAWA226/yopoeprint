import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private isConfigured = false;

  constructor() {
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

    return this.sendMail(email, subject, html);
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

    return this.sendMail(email, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (!this.isConfigured) {
      this.logger.log(`[Simulation Email] À: ${to} | Sujet: ${subject}`);
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
        return null;
      }
      this.logger.log(`Email envoyé avec succès: ${data?.id}`);
      return data;
    } catch (error: any) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error?.message || error}`);
      // On ne throw pas l'erreur pour ne pas bloquer le flux principal
      return null;
    }
  }
}
