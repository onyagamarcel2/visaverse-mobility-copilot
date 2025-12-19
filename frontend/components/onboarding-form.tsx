"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export function OnboardingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    originCountry: "",
    destinationCountry: "",
    purpose: "",
    departureDate: "",
    duration: "",
    passportExpiry: "",
    hasSponsor: false,
    fundsLevel: "",
    language: "en",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Store form data in localStorage
    localStorage.setItem("visaverse_profile", JSON.stringify(formData))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Navigate to plan page
    router.push("/plan")
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <Card className="p-8 border-border">
        <div className="space-y-6">
          {/* Origin Country */}
          <div className="space-y-2">
            <Label htmlFor="originCountry">Origin Country</Label>
            <Select
              value={formData.originCountry}
              onValueChange={(value) => updateField("originCountry", value)}
              required
            >
              <SelectTrigger id="originCountry">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="in">India</SelectItem>
                <SelectItem value="cn">China</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="br">Brazil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destination Country */}
          <div className="space-y-2">
            <Label htmlFor="destinationCountry">Destination Country</Label>
            <Select
              value={formData.destinationCountry}
              onValueChange={(value) => updateField("destinationCountry", value)}
              required
            >
              <SelectTrigger id="destinationCountry">
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="de">Germany</SelectItem>
                <SelectItem value="fr">France</SelectItem>
                <SelectItem value="in">India</SelectItem>
                <SelectItem value="cn">China</SelectItem>
                <SelectItem value="jp">Japan</SelectItem>
                <SelectItem value="br">Brazil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Travel</Label>
            <Select value={formData.purpose} onValueChange={(value) => updateField("purpose", value)} required>
              <SelectTrigger id="purpose">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="tourism">Tourism</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates and Duration */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="departureDate">Planned Departure Date</Label>
              <Input
                id="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={(e) => updateField("departureDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="e.g., 6"
                value={formData.duration}
                onChange={(e) => updateField("duration", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Passport Expiry */}
          <div className="space-y-2">
            <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
            <Input
              id="passportExpiry"
              type="date"
              value={formData.passportExpiry}
              onChange={(e) => updateField("passportExpiry", e.target.value)}
              required
            />
          </div>

          {/* Sponsor */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div className="space-y-0.5">
              <Label htmlFor="hasSponsor">Do you have a sponsor?</Label>
              <p className="text-sm text-muted-foreground">Someone financially supporting your trip</p>
            </div>
            <Switch
              id="hasSponsor"
              checked={formData.hasSponsor}
              onCheckedChange={(checked) => updateField("hasSponsor", checked)}
            />
          </div>

          {/* Funds Level */}
          <div className="space-y-2">
            <Label htmlFor="fundsLevel">Proof of Funds Level</Label>
            <Select value={formData.fundsLevel} onValueChange={(value) => updateField("fundsLevel", value)} required>
              <SelectTrigger id="fundsLevel">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Basic requirements)</SelectItem>
                <SelectItem value="medium">Medium (Comfortable)</SelectItem>
                <SelectItem value="high">High (Abundant)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select value={formData.language} onValueChange={(value) => updateField("language", value)}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special circumstances or questions..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-8 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Your Plan...
            </>
          ) : (
            "Generate My Plan"
          )}
        </Button>
      </Card>
    </form>
  )
}
