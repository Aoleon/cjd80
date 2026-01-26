'use client';

/**
 * Page de Test du Système de Thème
 * Pour tester toutes les couleurs et variantes en light/dark mode
 */

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useThemeColors } from '@/lib/theme/theme-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ThemeTestPage() {
  const colors = useThemeColors();

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Test du Système de Thème</h1>
          <p className="text-muted-foreground mt-2">
            Testez toutes les variantes de couleurs en light et dark mode
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Couleurs Principales */}
      <Card>
        <CardHeader>
          <CardTitle>Couleurs Principales</CardTitle>
          <CardDescription>Couleurs de base du système de design</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch
            name="Primary"
            bgClass="bg-primary"
            textClass="text-primary-foreground"
            hex={colors.primary}
          />
          <ColorSwatch
            name="Secondary"
            bgClass="bg-secondary"
            textClass="text-secondary-foreground"
            hex={colors.secondary}
          />
          <ColorSwatch
            name="Accent"
            bgClass="bg-accent"
            textClass="text-accent-foreground"
            hex={colors.primary}
          />
          <ColorSwatch
            name="Muted"
            bgClass="bg-muted"
            textClass="text-muted-foreground"
            hex="#e5e7eb"
          />
        </CardContent>
      </Card>

      {/* Couleurs de Statut */}
      <Card>
        <CardHeader>
          <CardTitle>Couleurs de Statut</CardTitle>
          <CardDescription>Feedback visuel pour les états</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success */}
          <div>
            <h3 className="font-semibold mb-3">Success</h3>
            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch
                name="Success"
                bgClass="bg-success"
                textClass="text-success-foreground"
                hex={colors.success}
              />
              <ColorSwatch
                name="Success Dark"
                bgClass="bg-success-dark"
                textClass="text-success-foreground"
                hex={colors.successDark}
              />
              <ColorSwatch
                name="Success Light"
                bgClass="bg-success-light"
                textClass="text-success-dark"
                hex={colors.successLight}
              />
            </div>
          </div>

          {/* Warning */}
          <div>
            <h3 className="font-semibold mb-3">Warning</h3>
            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch
                name="Warning"
                bgClass="bg-warning"
                textClass="text-warning-foreground"
                hex={colors.warning}
              />
              <ColorSwatch
                name="Warning Dark"
                bgClass="bg-warning-dark"
                textClass="text-warning-foreground"
                hex={colors.warningDark}
              />
              <ColorSwatch
                name="Warning Light"
                bgClass="bg-warning-light"
                textClass="text-warning-dark"
                hex={colors.warningLight}
              />
            </div>
          </div>

          {/* Error */}
          <div>
            <h3 className="font-semibold mb-3">Error</h3>
            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch
                name="Error"
                bgClass="bg-error"
                textClass="text-error-foreground"
                hex={colors.error}
              />
              <ColorSwatch
                name="Error Dark"
                bgClass="bg-error-dark"
                textClass="text-error-foreground"
                hex={colors.errorDark}
              />
              <ColorSwatch
                name="Error Light"
                bgClass="bg-error-light"
                textClass="text-error-dark"
                hex={colors.errorLight}
              />
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold mb-3">Info</h3>
            <div className="grid grid-cols-3 gap-4">
              <ColorSwatch
                name="Info"
                bgClass="bg-info"
                textClass="text-info-foreground"
                hex={colors.info}
              />
              <ColorSwatch
                name="Info Dark"
                bgClass="bg-info-dark"
                textClass="text-info-foreground"
                hex={colors.infoDark}
              />
              <ColorSwatch
                name="Info Light"
                bgClass="bg-info-light"
                textClass="text-info-dark"
                hex={colors.infoLight}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Couleurs de Marque */}
      <Card>
        <CardHeader>
          <CardTitle>Couleurs de Marque CJD</CardTitle>
          <CardDescription>Alias pour la couleur principale</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <ColorSwatch
            name="CJD Green"
            bgClass="bg-cjd-green"
            textClass="text-white"
            hex={colors.primary}
          />
          <ColorSwatch
            name="CJD Green Dark"
            bgClass="bg-cjd-green-dark"
            textClass="text-white"
            hex={colors.primaryDark}
          />
          <ColorSwatch
            name="CJD Green Light"
            bgClass="bg-cjd-green-light"
            textClass="text-foreground"
            hex={colors.primaryLight}
          />
        </CardContent>
      </Card>

      {/* Composants UI */}
      <Card>
        <CardHeader>
          <CardTitle>Composants UI</CardTitle>
          <CardDescription>Test des composants avec le thème</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Buttons */}
          <div>
            <h3 className="font-semibold mb-3">Buttons</h3>
            <div className="flex gap-2 flex-wrap">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="font-semibold mb-3">Badges</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge className="bg-success text-success-foreground">Success</Badge>
              <Badge className="bg-warning text-warning-foreground">Warning</Badge>
              <Badge className="bg-info text-info-foreground">Info</Badge>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="font-semibold mb-3">Cards</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Card content goes here.</p>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Primary Card</CardTitle>
                  <CardDescription>With primary border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Highlighted card.</p>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle>Muted Card</CardTitle>
                  <CardDescription>With muted background</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Subtle card variant.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typographie</CardTitle>
          <CardDescription>Styles de texte disponibles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <h2 className="text-3xl font-bold">Heading 2</h2>
            <h3 className="text-2xl font-bold">Heading 3</h3>
            <h4 className="text-xl font-bold">Heading 4</h4>
            <p className="text-lg mt-4">Large paragraph text</p>
            <p className="text-base">Base paragraph text</p>
            <p className="text-sm">Small paragraph text</p>
            <p className="text-xs">Extra small paragraph text</p>
          </div>
          <div>
            <p className="text-muted-foreground">Muted foreground text</p>
            <p className="text-primary">Primary colored text</p>
            <p className="text-success">Success colored text</p>
            <p className="text-error">Error colored text</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant helper pour afficher un swatch de couleur
function ColorSwatch({
  name,
  bgClass,
  textClass,
  hex,
}: {
  name: string;
  bgClass: string;
  textClass: string;
  hex: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`${bgClass} ${textClass} p-6 rounded-lg text-center font-medium`}>
        {name}
      </div>
      <p className="text-xs text-muted-foreground text-center">{hex}</p>
    </div>
  );
}
