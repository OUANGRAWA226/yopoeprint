import { api } from './api'

export interface UploadResponse {
  url: string
  key?: string
  size?: number
}

export const uploadService = {
  /**
   * Upload a single file to the backend
   * Assumes the backend expects a `multipart/form-data` with a 'file' field.
   */
  async uploadFile(file: File, folder: string = 'general'): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    try {
      // Change '/upload' to your actual NestJS endpoint if different (e.g. '/media/upload')
      const response = await api.upload<UploadResponse | any>('/upload', formData)
      
      // Adapt based on NestJS response format:
      if (response && response.url) {
        return response
      }
      
      // Fallback if the API returns a string or a different structure
      return {
        url: typeof response === 'string' ? response : (response?.data?.url || ''),
      }
    } catch (error) {
      console.error('[uploadService] Error uploading file:', error)
      throw error
    }
  }
}
