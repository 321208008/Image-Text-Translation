"use client"

import { useState, useCallback } from 'react'
import { Upload, Image as ImageIcon, Languages, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { extractTextFromImage, translateText, improveText } from '@/lib/gemini'
import { getLanguageCategories, getLanguagesByCategory } from '@/lib/languages'
import { useI18n } from '@/lib/i18n/use-translations'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { AdSense } from '@/components/adsense'

export default function Home() {
  const { toast } = useToast()
  const { t } = useI18n()
  const [image, setImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: t('error.invalidFile'),
        description: t('error.invalidFileDesc'),
        variant: "destructive"
      })
    }
  }, [toast, t])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExtractText = async () => {
    if (!image) {
      toast({
        title: t('error.noImage'),
        description: t('error.noImageDesc'),
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const text = await extractTextFromImage(image)
      setExtractedText(text)
      toast({
        title: t('success.extracted'),
        description: t('success.description')
      })
    } catch (error) {
      toast({
        title: t('error.extracting'),
        description: t('error.extractingDesc'),
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTranslate = async () => {
    if (!extractedText) {
      toast({
        title: t('error.noText'),
        description: t('error.noTextDesc'),
        variant: "destructive"
      })
      return
    }

    if (!selectedLanguage) {
      toast({
        title: t('error.noLanguage'),
        description: t('error.noLanguageDesc'),
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const translated = await translateText(extractedText, selectedLanguage)
      setTranslatedText(translated)
      toast({
        title: t('success.translated'),
        description: t('success.description')
      })
    } catch (error) {
      toast({
        title: t('error.translating'),
        description: t('error.translatingDesc'),
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImprove = async () => {
    if (!translatedText) {
      toast({
        title: t('error.noTranslation'),
        description: t('error.noTranslationDesc'),
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const improved = await improveText(translatedText, selectedLanguage)
      setTranslatedText(improved)
      toast({
        title: t('success.improved'),
        description: t('success.description')
      })
    } catch (error) {
      toast({
        title: t('error.improving'),
        description: t('error.improvingDesc'),
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-center">
            <div 
              className={`relative w-full max-w-md aspect-video border-2 ${isDragging ? 'border-primary' : 'border-dashed'} rounded-lg flex items-center justify-center transition-colors ${isDragging ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {image ? (
                <img
                  src={image}
                  alt="Uploaded"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">{isDragging ? t('dropHere') : t('uploadImage')}</p>
                  <p className="mt-1 text-xs text-gray-400">{t('dragAndDrop')}</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleExtractText}
              disabled={!image || isProcessing}
              className="w-40"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('extractText')}
            </Button>

            <Select onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {getLanguageCategories().map(category => (
                  <SelectGroup key={category}>
                    <SelectLabel>{category}</SelectLabel>
                    {getLanguagesByCategory(category).map(language => (
                      <SelectItem key={language.code} value={language.name}>
                        {language.nativeName} ({language.name})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleTranslate}
              disabled={!extractedText || !selectedLanguage || isProcessing}
              className="w-40"
            >
              <Languages className="mr-2 h-4 w-4" />
              {t('translate')}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleImprove}
                    disabled={!translatedText || isProcessing}
                    variant="outline"
                    className="w-40"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    {t('improve')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('improveTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Tabs defaultValue="extracted" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="extracted">{t('extractedText')}</TabsTrigger>
              <TabsTrigger value="translated">{t('translatedText')}</TabsTrigger>
            </TabsList>
            <TabsContent value="extracted">
              <Card className="p-4">
                <pre className="whitespace-pre-wrap">{extractedText || t('noTextExtracted')}</pre>
              </Card>
            </TabsContent>
            <TabsContent value="translated">
              <Card className="p-4">
                <pre className="whitespace-pre-wrap">{translatedText || t('noTranslation')}</pre>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}