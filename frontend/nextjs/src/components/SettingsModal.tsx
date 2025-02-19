'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Provider, providerOptions, saveSettings, getSettings } from '@/stores/settings'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState<Provider | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [customModel, setCustomModel] = useState('')

  useEffect(() => {
    const settings = getSettings()
    setProvider(settings.provider)
    setModel(settings.model)
  }, [])

  const allowsCustomModel = provider === 'openrouter' || provider === 'ollama'
  const modelList = provider ? providerOptions[provider] : []

  const handleProviderChange = (value: Provider) => {
    setProvider(value)
    setModel(null)
    setCustomModel('')
  }

  const handleSave = async () => {
    const newModel = allowsCustomModel ? customModel : model
    if (provider && newModel) {
      saveSettings({ provider, model: newModel })
      
      try {
        const response = await fetch('http://localhost:8080/api/v1/settings/update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            { key: 'provider', value: provider },
            { key: 'model', value: newModel }
          ])
        });

        if (!response.ok) {
          throw new Error('Failed to update settings');
        }

        onClose();
      } catch (error) {
        console.error('Failed to update settings:', error);
        // Optionally show error to user
      }
    }
  }

  const isValid = provider && (allowsCustomModel ? customModel : model)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select AI Provider</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Provider
            </label>
            <Select
              value={provider || ''}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(providerOptions).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Model
            </label>
            {allowsCustomModel ? (
              <Input
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="Enter model name"
                disabled={!provider}
              />
            ) : (
              <Select
                value={model || ''}
                onValueChange={setModel}
                disabled={!provider}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {modelList.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 