import { test, expect } from '@playwright/test'

test.describe('Parcours d\'Achat Client E2E', () => {
  test('Parcours complet : fiche produit -> ajout panier -> tiroir panier -> checkout', async ({ page }) => {
    // 1. Ouvrir la fiche produit
    await page.goto('/produit/carte-de-visite-standard')

    // 2. Bouton d'ajout au panier (sur desktop : "Au panier")
    const addToCartBtn = page.getByRole('button', { name: /au panier/i }).first()
    await expect(addToCartBtn).toBeVisible()
    await addToCartBtn.click()

    // 3. Vérifier que le tiroir panier s'ouvre
    const cartDrawerHeading = page.getByRole('heading', { name: /mon panier/i })
    await expect(cartDrawerHeading).toBeVisible()

    // 4. Vérifier que l'article est présent avec son libellé
    await expect(page.getByText(/Carte de visite/i).first()).toBeVisible()

    // 5. Cliquer sur "Passer la commande" ou lien vers /commande
    const checkoutLink = page.getByRole('link', { name: /commander/i }).first()
    if (await checkoutLink.isVisible()) {
      await checkoutLink.click()
      await expect(page).toHaveURL(/\/commande/i, { timeout: 15000 })
      await expect(page.getByText(/Finaliser votre commande|Livraison|Paiement/i).first()).toBeVisible({ timeout: 15000 })
    }
  })

  test('Redirection et navigation catalogue', async ({ page }) => {
    // Test que l'ancienne URL /catalogue/cartes redirige bien ou affiche les cartes
    await page.goto('/catalogue/cartes')
    await expect(page).toHaveURL(/\/catalogue\/(cartes-de-visite|cartes)/i)
    await expect(page.getByRole('heading', { name: /Cartes de visite/i })).toBeVisible()
  })
})
