"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import { useModelAvailability } from "@/hooks/useModelAvailability"

export default function PromptPage() {
  const [text, setText] = useState<string>("")
  const [isPrompting, setIsPrompting] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    error,
    status,
    modelDownloadProgress,
    downloadModel,
    createModel,
    setError,
  } = useModelAvailability({
    isSupported: () => "LanguageModel" in self,
    checkAvailability: async () => {
      return await LanguageModel.availability()
    },
    createModel: async () => {
      return await LanguageModel.create({
        initialPrompts: [
          {
            role: "system",
            content: "You are a helpful and friendly assistant.",
          },
        ],
      })
    },
    downloadModel: async (options, onProgress) => {
      await LanguageModel.create({
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            onProgress?.(e.loaded * 100)
            console.log(`Downloaded ${e.loaded * 100}%`)
          })
        },
      })
    },
    notSupportedError: "Prompt AI is not supported",
    unavailableError: "Prompt AI is not available",
  })

  const promptStream = async (text: string) => {
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsPrompting(true)
    setResponse(null)
    setError(null)

    const promptAIModel = await createModel()
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
    setError(null)

    try {
      const promptAIModel = await createModel()
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

  console.log(status)

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prompt AI</h1>
      <p>Status: {status}</p>
      {status === "downloadable" && (
        <div className="my-4">
          <Button onClick={() => downloadModel()} className="cursor-pointer">
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
              disabled={!isPrompting || !text}
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
