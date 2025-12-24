"use client"

import { useId, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Copy, Check, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"

interface SharePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SharePlanDialog({ open, onOpenChange }: SharePlanDialogProps) {
  const [copied, setCopied] = useState(false)
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  const { messages } = useI18n()
  const linkId = useId().replace(/:/g, "")

  // Generate a mock shareable link
  const shareableLink = `https://visaverse.app/shared/${linkId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setCopied(true)
    toast({
      title: messages.share.copyToastTitle,
      description: messages.share.copyToastDescription,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailShare = () => {
    if (!email) {
      toast({
        title: messages.share.emailRequiredTitle,
        description: messages.share.emailRequiredDescription,
        variant: "destructive",
      })
      return
    }

    toast({
      title: messages.share.emailSentTitle,
      description: messages.share.emailSentDescription.replace("{email}", email),
    })
    setEmail("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{messages.share.title}</DialogTitle>
          <DialogDescription>{messages.share.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Shareable Link */}
          <div className="space-y-2">
            <Label>{messages.share.linkLabel}</Label>
            <div className="flex gap-2">
              <Input value={shareableLink} readOnly className="flex-1" />
              <Button size="icon" variant="outline" onClick={handleCopyLink}>
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Password Protection */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="password"
              checked={passwordProtected}
              onCheckedChange={(checked) => setPasswordProtected(checked as boolean)}
            />
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {messages.share.passwordProtect}
            </label>
          </div>

          {passwordProtected && (
            <div className="space-y-2">
              <Label htmlFor="share-password">{messages.share.passwordLabel}</Label>
              <Input
                id="share-password"
                type="password"
                placeholder={messages.share.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {/* Email Sharing */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="email">{messages.share.emailLabel}</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder={messages.share.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button size="icon" variant="outline" onClick={handleEmailShare}>
                <Mail className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {messages.share.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
