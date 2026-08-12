import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe2, Heart, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'About | Readora',
  description: 'Learn about Readora, the public digital library providing access to copyright-free literature for everyone.',
};

export default function AboutPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge className="rounded-full px-4 py-1 bg-primary/10 text-primary border-0 font-semibold">
          Open Public Domain Library
        </Badge>
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight">
          Literature Free for Everyone, Everywhere.
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          Readora is built on a simple belief: world literature, historical wisdom, and sacred texts belong to human history and should be accessible to all without paywalls or subscription barriers.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl p-6 text-center space-y-3 bg-card border">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Globe2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg">100% Free & Open</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every book in our digital library is in the public domain or copyright-free. No credit cards or subscriptions required.
          </p>
        </Card>

        <Card className="rounded-3xl p-6 text-center space-y-3 bg-card border">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg">Premium Reader</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Distraction-free digital reading with custom typography, light, dark, and sepia themes, reading progress, and bookmarks.
          </p>
        </Card>

        <Card className="rounded-3xl p-6 text-center space-y-3 bg-card border">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg">Sacred & Classic Texts</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Preserving classical literature, philosophy, and sacred manuscripts across world traditions for future generations.
          </p>
        </Card>
      </div>

      {/* Mission Banner */}
      <div className="rounded-3xl bg-muted/40 p-8 md:p-12 text-center space-y-4 border">
        <Heart className="w-8 h-8 text-primary mx-auto" />
        <h2 className="font-serif text-2xl md:text-3xl font-bold">Powered by Open Data</h2>
        <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Book metadata and texts are preserved and syndicated via Project Gutenberg, Gutendex APIs, and community contributors.
        </p>
      </div>
    </div>
  );
}
