"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"

type TranslatorStatus =
  | "downloadable"
  | "downloading"
  | "available"
  | "unavailable"

async function isPromptAIAvailable() {
  return await LanguageModel.availability()
}

export default function TranslatorPage() {
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<TranslatorStatus>()
  const [modelDownloadProgress, setModelDownloadProgress] = useState(0)
  const [text, setText] = useState<string>("")
  const [isPrompting, setIsPrompting] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  async function downloadPromptAIModel() {
    await LanguageModel.create({
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          setModelDownloadProgress(e.loaded * 100)
          console.log(`Downloaded ${e.loaded * 100}%`)
        })
      },
    })

    const result = await isPromptAIAvailable()
    setStatus(result)
  }

  const createPromptAIModel = async () => {
    const promptAIModel = await LanguageModel.create({
      initialPrompts: [
        {
          role: "system",
          content: "You are a helpful and friendly assistant.",
        },
      ],
    })
    return promptAIModel
  }

  const checkTranslationAvailability = async () => {
    if (!isPromptAIAvailable()) {
      setError("Prompt AI is not supported")
      return
    }

    const result = await isPromptAIAvailable()

    setStatus(result)

    if (result === "unavailable") {
      setError("Prompt AI is not available")
      return
    }
  }

  const promptStream = async (text: string) => {
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsPrompting(true)
    setResponse(null)
    const promptAIModel = await createPromptAIModel()
    const result = promptAIModel.promptStreaming(text, {
      signal: controller.signal,
    })
    let response = ""

    try {
      for await (const chunk of result) {
        response += chunk
        setResponse(response)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setError("Prompt aborted")
      } else {
        throw error
      }
    } finally {
      setIsPrompting(false)
      abortControllerRef.current = null
    }
  }

  const prompt = async (text: string) => {
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsPrompting(true)
    setResponse(null)

    try {
      const promptAIModel = await createPromptAIModel()
      const result = await promptAIModel.prompt(text, {
        signal: controller.signal,
      })
      setResponse(result)
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setError("Prompt aborted")
      } else {
        throw error
      }
    } finally {
      setIsPrompting(false)
      abortControllerRef.current = null
    }
  }

  useEffect(() => {
    checkTranslationAvailability()
  }, [])

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prompt AI (Legacy)</h1>
      <p>Status: {status}</p>
      {status === "downloadable" && (
        <div className="my-4">
          <Button onClick={() => downloadPromptAIModel()}>
            Download Model
          </Button>
          <p>Download progress: {modelDownloadProgress}%</p>
        </div>
      )}
      <p className="text-red-500 py-2">{error}</p>

      {status === "available" && (
        <div className="my-4 grid gap-4">
          <div className="flex gap-2 max-w-4xl">
            <Input
              type="text"
              placeholder="Enter text to prompt"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="cursor-pointer flex-1"
              onClick={() => {
                promptStream(text)
              }}
              disabled={isPrompting || !text}
            >
              Prompt
            </Button>
            <Button
              className="cursor-pointer"
              onClick={() => {
                abortControllerRef.current?.abort()
              }}
              disabled={!isPrompting}
            >
              Stop
            </Button>
          </div>
          {response && (
            <div className="flex gap-2 max-w-4xl">
              <pre className="max-w-4xl whitespace-pre-wrap">{response}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
