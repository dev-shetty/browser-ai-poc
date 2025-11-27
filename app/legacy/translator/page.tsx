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
import { useEffect, useState } from "react"

type TranslatorStatus =
  | "downloadable"
  | "downloading"
  | "available"
  | "unavailable"

const SOURCE_LANGUAGE = "en"
const TARGET_LANGUAGE = "kn"

function isTranslatorSupported() {
  return "Translator" in self
}

async function isTranslationAvailable(
  sourceLanguage: string,
  targetLanguage: string
) {
  return await Translator.availability({
    sourceLanguage,
    targetLanguage,
  })
}

export default function TranslatorPage() {
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<TranslatorStatus>()
  const [modelDownloadProgress, setModelDownloadProgress] = useState<number>(0)
  const [text, setText] = useState<string>("")
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [selectedLanguages, setSelectedLanguages] = useState<{
    sourceLanguage: string
    targetLanguage: string
  }>({
    sourceLanguage: SOURCE_LANGUAGE,
    targetLanguage: TARGET_LANGUAGE,
  })

  async function downloadTranslator(
    sourceLanguage: string,
    targetLanguage: string
  ) {
    await Translator.create({
      sourceLanguage,
      targetLanguage,
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          setModelDownloadProgress(e.loaded * 100)
          console.log(`Downloaded ${e.loaded * 100}%`)
        })
      },
    })

    const result = await isTranslationAvailable(sourceLanguage, targetLanguage)
    setStatus(result)
  }

  const createTranslator = async (
    sourceLanguage: string,
    targetLanguage: string
  ) => {
    const translator = await Translator.create({
      sourceLanguage,
      targetLanguage,
    })
    return translator
  }

  const checkTranslationAvailability = async () => {
    if (!isTranslatorSupported()) {
      setError("Translator is not supported")
      return
    }

    const result = await isTranslationAvailable(
      SOURCE_LANGUAGE,
      TARGET_LANGUAGE
    )

    setStatus(result)

    if (result === "unavailable") {
      setError("Translation is not available for the selected languages")
      return
    }
  }

  const translate = async (text: string) => {
    const translator = await createTranslator(
      selectedLanguages.sourceLanguage,
      selectedLanguages.targetLanguage
    )
    const result = await translator.translate(text)
    setTranslatedText(result)
  }

  useEffect(() => {
    checkTranslationAvailability()
  }, [])

  return (
    <div className="p-12">
      <h1 className="text-2xl font-bold mb-4">Translator (Legacy)</h1>
      <p>Status: {status}</p>
      {status === "downloadable" && (
        <div className="my-4">
          <Button
            onClick={() =>
              downloadTranslator(
                selectedLanguages.sourceLanguage,
                selectedLanguages.targetLanguage
              )
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
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="kn">Kannada</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
                <SelectItem value="mr">Marathi</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
                <SelectItem value="pa">Punjabi</SelectItem>
                <SelectItem value="ur">Urdu</SelectItem>
                <SelectItem value="gu">Gujarati</SelectItem>
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
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="kn">Kannada</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
                <SelectItem value="mr">Marathi</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
                <SelectItem value="pa">Punjabi</SelectItem>
                <SelectItem value="ur">Urdu</SelectItem>
                <SelectItem value="gu">Gujarati</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={async () => {
                const result = await isTranslationAvailable(
                  selectedLanguages.sourceLanguage,
                  selectedLanguages.targetLanguage
                )
                setStatus(result)
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
