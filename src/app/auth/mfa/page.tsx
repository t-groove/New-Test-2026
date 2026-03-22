'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '../../../../supabase/client'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

export default function MFAPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [factorId, setFactorId] = useState<string | null>(null)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const getFactorId = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.mfa.listFactors()
      const totpFactor = data?.totp?.[0]
      if (totpFactor) {
        setFactorId(totpFactor.id)
      }
    }
    getFactorId()
    inputRef.current?.focus()
  }, [])

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return

    setIsVerifying(true)
    setError('')

    const supabase = createClient()

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId })

    if (challengeError) {
      setError(challengeError.message)
      setIsVerifying(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    })

    if (verifyError) {
      setError('Invalid code. Please try again.')
      setCode('')
      setIsVerifying(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1E2A45] rounded-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-syne font-bold text-2xl text-[#E8ECF4]">
            EZ Ledgr
          </h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#4F7FFF]/10
            flex items-center justify-center">
            <Shield size={28} className="text-[#4F7FFF]" />
          </div>
        </div>

        <h2 className="font-syne font-bold text-xl text-[#E8ECF4]
          text-center mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-[#6B7A99] text-center mb-6">
          Enter the 6-digit code from your authenticator app
        </p>

        {/* Code input */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={e => setCode(
            e.target.value.replace(/[^0-9]/g, '')
          )}
          placeholder="000000"
          className="w-full bg-[#0A0F1E] border border-[#1E2A45]
            text-[#E8ECF4] rounded-lg px-4 py-3 text-center
            text-2xl font-mono tracking-widest
            focus:outline-none focus:ring-2 focus:ring-[#4F7FFF]
            placeholder:text-[#6B7A99] mb-3"
        />

        {error && (
          <p className="text-sm text-[#EF4444] text-center mb-3">
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={code.length !== 6 || isVerifying}
          className="w-full bg-[#4F7FFF] hover:bg-[#3D6FEF]
            disabled:opacity-50 text-white font-semibold
            rounded-lg py-3 text-sm transition-colors"
        >
          {isVerifying ? 'Verifying...' : 'Verify →'}
        </button>

        <p className="text-xs text-[#6B7A99] text-center mt-4">
          Open your authenticator app (Google Authenticator,
          Authy, etc.) to get your code
        </p>

        {/* Sign out link */}
        <div className="text-center mt-4">
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              router.push('/sign-in')
            }}
            className="text-sm text-[#6B7A99] hover:text-[#E8ECF4]
              transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
