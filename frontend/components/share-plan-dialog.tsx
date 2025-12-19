"use client"

import { useState } from "react"
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

  // Generate a mock shareable link
  const shareableLink = `https://visaverse.app/shared/${Math.random().toString(36).substring(7)}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setCopied(true)
    toast({
      title: "Link Copied",
      description: "The shareable link has been copied to your clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailShare = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Email Sent",
      description: `Your plan has been shared with ${email}`,
    })
    setEmail("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Plan</DialogTitle>
          <DialogDescription>Share your mobility plan with family, friends, or colleagues.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Shareable Link */}
          <div className="space-y-2">
            <Label>Shareable Link</Label>
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
              Password protect this link
            </label>
          </div>

          {passwordProtected && (
            <div className="space-y-2">
              <Label htmlFor="share-password">Password</Label>
              <Input
                id="share-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {/* Email Sharing */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="email">Or share via email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
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
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
