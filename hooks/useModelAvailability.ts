import { useEffect, useState } from "react"

export type ModelStatus =
  | "downloadable"
  | "downloading"
  | "available"
  | "unavailable"

export interface ModelConfig<TCreateOptions = any, TAvailabilityOptions = any> {
  // Check if the API is supported in the browser
  isSupported: () => boolean

  // Check availability of the model
  checkAvailability: (options?: TAvailabilityOptions) => Promise<ModelStatus>

  // Create the model instance
  createModel: (options?: TCreateOptions) => Promise<any>

  // Download the model (with progress monitoring)
  downloadModel: (
    options?: TCreateOptions,
    onProgress?: (progress: number) => void
  ) => Promise<void>

  // Error messages
  notSupportedError: string
  unavailableError: string
}

export function useModelAvailability<
  TCreateOptions = any,
  TAvailabilityOptions = any
>(config: ModelConfig<TCreateOptions, TAvailabilityOptions>) {
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ModelStatus>()
  const [modelDownloadProgress, setModelDownloadProgress] = useState<number>(0)

  const checkAvailability = async (options?: TAvailabilityOptions) => {
    if (!config.isSupported()) {
      setError(config.notSupportedError)
      return
    }

    const result = await config.checkAvailability(options)
    setStatus(result)

    if (result === "unavailable") {
      setError(config.unavailableError)
      return
    }
  }

  const downloadModel = async (
    options?: TCreateOptions,
    onProgress?: (progress: number) => void
  ) => {
    await config.downloadModel(options, (progress) => {
      setModelDownloadProgress(progress)
      onProgress?.(progress)
    })

    const result = await config.checkAvailability(options as any)
    setStatus(result)
  }

  const createModel = async (options?: TCreateOptions) => {
    return await config.createModel(options)
  }

  useEffect(() => {
    checkAvailability()
  }, [])

  return {
    error,
    status,
    modelDownloadProgress,
    checkAvailability,
    downloadModel,
    createModel,
    setError,
    setStatus,
  } as const
}
