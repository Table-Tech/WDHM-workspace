'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InviteButtonProps {
  variant?: 'icon' | 'full';
}

export function InviteButton({ variant = 'full' }: InviteButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShare = async () => {
    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Late Table',
          text: 'Kom erbij in Late Table en volg wie er te laat komt!',
          url: inviteUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to modal
        if (!(err instanceof Error) || err.message !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }

    // Fall back to modal
    setOpen(true);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Kom erbij in Late Table en volg wie er te laat komt! ${inviteUrl}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (variant === 'icon') {
    return (
      <>
        <Button
          onClick={handleShare}
          variant="ghost"
          size="icon"
          aria-label="Deel uitnodiging"
          title="Deel uitnodiging"
        >
          <Share2 className="w-4 h-4" />
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uitnodiging delen</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Copyable URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Link kopieëren:</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
                    <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={inviteUrl}
                      readOnly
                      className="flex-1 bg-transparent text-sm outline-none"
                    />
                  </div>
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    size="icon"
                    aria-label={copied ? 'Gekopieerd' : 'Kopieëren'}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Via WhatsApp:</label>
                <Button
                  onClick={handleWhatsAppShare}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.119 7.757L2.5 23l8.283-2.188a9.856 9.856 0 004.773 1.22h.004c5.396 0 9.747-4.356 9.747-9.753 0-2.605-.635-5.02-1.848-7.145-1.213-2.126-2.92-3.957-5.099-5.055-2.179-1.099-4.657-1.687-7.257-1.687z" />
                  </svg>
                  Deel op WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button onClick={handleShare} className="gap-2">
        <Share2 className="w-4 h-4" />
        Uitnodiging delen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uitnodiging delen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Copyable URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Link kopieëren:</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
                  <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="icon"
                  aria-label={copied ? 'Gekopieerd' : 'Kopieëren'}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Via WhatsApp:</label>
              <Button
                onClick={handleWhatsAppShare}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.119 7.757L2.5 23l8.283-2.188a9.856 9.856 0 004.773 1.22h.004c5.396 0 9.747-4.356 9.747-9.753 0-2.605-.635-5.02-1.848-7.145-1.213-2.126-2.92-3.957-5.099-5.055-2.179-1.099-4.657-1.687-7.257-1.687z" />
                </svg>
                Deel op WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
