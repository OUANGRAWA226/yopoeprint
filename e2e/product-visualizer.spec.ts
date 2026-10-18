import { test, expect } from '@playwright/test'

test.describe('Visualiseur Studio Produit 3D', () => {
  test('Affiche correctement la fiche produit et les commandes du visualiseur', async ({ page }) => {
    // 1. Navigation vers la carte de visite standard
    await page.goto('/produit/carte-de-visite-standard')
    await expect(page).toHaveTitle(/Carte de visite/i)

    // 2. Vérification des boutons de la barre d'outils du studio (noms stricts)
    const studioBtn = page.getByRole('button', { name: 'Studio', exact: true })
    const standBtn = page.getByRole('button', { name: 'Stand', exact: true })
    const nuitBtn = page.getByRole('button', { name: 'Nuit', exact: true })

    await expect(studioBtn).toBeVisible()
    await expect(standBtn).toBeVisible()
    await expect(nuitBtn).toBeVisible()

    // 3. Basculement d'ambiance d'éclairage
    await standBtn.click()
    await nuitBtn.click()
    await studioBtn.click()

    // 4. Vérification des cotes architecturales
    const cotesBtn = page.getByRole('button', { name: /cotes/i }).first()
    await expect(cotesBtn).toBeVisible()
    await cotesBtn.click()
    await expect(page.getByText(/85\s*×\s*55/i).first()).toBeVisible()

    // 5. Basculement Recto / Verso
    const versoBtn = page.getByRole('button', { name: /voir verso/i })
    if (await versoBtn.isVisible()) {
      await versoBtn.click()
      await expect(page.getByRole('button', { name: /voir recto/i })).toBeVisible()
      await page.getByRole('button', { name: /voir recto/i }).click()
    }

    // 6. Comparateur d'échelle
    const echelleBtn = page.getByRole('button', { name: /échelle 1:1|taille réelle/i })
    await expect(echelleBtn).toBeVisible()
    await echelleBtn.click()
  })

  test('Met à jour les dimensions et le prix lors du chargement', async ({ page }) => {
    await page.goto('/produit/carte-de-visite-standard')

    // Vérification que le libellé "0 exemplaires" n'apparaît pas
    await expect(page.getByText(/Total TTC — 0 exemplaires/i)).not.toBeVisible()

    // Vérification de la présence des avis cohérents 4.9/5 et 127 avis
    await expect(page.getByText(/4\.9\/5/i).first()).toBeVisible()
    await expect(page.getByText(/127 avis/i).first()).toBeVisible()
  })
})
