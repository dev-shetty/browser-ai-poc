"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { useModelAvailability } from "@/hooks/useModelAvailability"

const SOURCE_LANGUAGE = "en"
const TARGET_LANGUAGE = "kn"

const DEFAULT_OPTIONS = {
  sourceLanguage: SOURCE_LANGUAGE,
  targetLanguage: TARGET_LANGUAGE,
}
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "te", label: "Telugu" },
  { value: "ta", label: "Tamil" },
  { value: "mr", label: "Marathi" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  // Foreign languages
  { value: "it", label: "Italian" },
  { value: "fr", label: "French" },
  { value: "ja", label: "Japanese" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
]

export default function TranslatorPage() {
  const [text, setText] = useState<string>("")
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [selectedLanguages, setSelectedLanguages] = useState<{
    sourceLanguage: string
    targetLanguage: string
  }>({
    sourceLanguage: SOURCE_LANGUAGE,
    targetLanguage: TARGET_LANGUAGE,
  })

  const {
    error,
    status,
    setStatus,
    modelDownloadProgress,
    checkAvailability,
    downloadModel,
    createModel,
  } = useModelAvailability({
    isSupported: () => "Translator" in self,
    checkAvailability: async (options) => {
      const { sourceLanguage, targetLanguage } = options || DEFAULT_OPTIONS
      return await Translator.availability({
        sourceLanguage,
        targetLanguage,
      })
    },
    createModel: async (options) => {
      const { sourceLanguage, targetLanguage } = options || DEFAULT_OPTIONS
      return await Translator.create({
        sourceLanguage,
        targetLanguage,
      })
    },
    downloadModel: async (options, onProgress) => {
      const { sourceLanguage, targetLanguage } = options || DEFAULT_OPTIONS
      await Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            onProgress?.(e.loaded * 100)
            console.log(`Downloaded ${e.loaded * 100}%`)
          })
        },
      })
    },
    notSupportedError: "Translator is not supported",
    unavailableError: "Translation is not available for the selected languages",
  })

  const translate = async (text: string) => {
    const translator = await createModel({
      sourceLanguage: selectedLanguages.sourceLanguage,
      targetLanguage: selectedLanguages.targetLanguage,
    })
    const result = await translator.translate(text)
    setTranslatedText(result)
  }

  return (
    <div className="p-12">
      <h1 className="text-2xl font-bold mb-4">Translator</h1>
      <p>Status: {status}</p>
      {status === "downloadable" && (
        <div className="my-4">
          <Button
            onClick={() =>
              downloadModel({
                sourceLanguage: selectedLanguages.sourceLanguage,
                targetLanguage: selectedLanguages.targetLanguage,
              })
            }
          >
            Download Model
          </Button>
          <p>Download progress: {modelDownloadProgress}%</p>
        </div>
      )}
      <p className="text-red-500 py-2">{error}</p>

      {status === "available" && (
        <div className="my-4 grid gap-4">
          <div className="flex gap-2">
            <Select
              value={selectedLanguages.sourceLanguage}
              onValueChange={(value) =>
                setSelectedLanguages({
                  ...selectedLanguages,
                  sourceLanguage: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.filter(
                  (lang) => lang.value !== selectedLanguages.targetLanguage
                ).map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedLanguages.targetLanguage}
              onValueChange={(value) =>
                setSelectedLanguages({
                  ...selectedLanguages,
                  targetLanguage: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.filter(
                  (lang) => lang.value !== selectedLanguages.sourceLanguage
                ).map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={async () => {
                const result = await checkAvailability({
                  sourceLanguage: selectedLanguages.sourceLanguage,
                  targetLanguage: selectedLanguages.targetLanguage,
                })
              }}
            >
              Check Availability
            </Button>
          </div>
          <div className="flex gap-2 max-w-4xl">
            <Input
              type="text"
              placeholder="Enter text to translate"
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                translate(e.target.value)
              }}
            />
          </div>
          {translatedText && (
            <div className="flex gap-2 max-w-4xl">
              <p>{translatedText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
