import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/context/useAuth'
import { registerSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import './Login.css'

type RegisterFieldErrors = Partial<Record<keyof z.infer<typeof registerSchema>, string>>
type RoleValue = z.infer<typeof registerSchema>['role']

export function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [firstLastName, setFirstLastName] = useState('')
  const [secondLastName, setSecondLastName] = useState('')
  const [cellphoneNumber, setCellphoneNumber] = useState('')
  const [role, setRole] = useState<RoleValue>('ROLE_USER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
  const { auth, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth) navigate('/accounts')
  }, [auth, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const parsed = registerSchema.safeParse({
      email,
      username,
      password,
      name,
      firstLastName,
      secondLastName: secondLastName || undefined,
      cellphoneNumber,
      role,
    })

    if (!parsed.success) {
      const { fieldErrors: issues } = z.flattenError(parsed.error)
      setFieldErrors({
        email: issues.email?.[0],
        username: issues.username?.[0],
        password: issues.password?.[0],
        name: issues.name?.[0],
        firstLastName: issues.firstLastName?.[0],
        secondLastName: issues.secondLastName?.[0],
        cellphoneNumber: issues.cellphoneNumber?.[0],
        role: issues.role?.[0],
      })
      return
    }

    setLoading(true)
    try {
      const result = await register(parsed.data)
      if (result.ok) {
        navigate('/accounts')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={!!fieldErrors.username}
          />
          {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
        </div>
        <div>
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>
        <div>
          <Input
            type="text"
            placeholder="First last name"
            value={firstLastName}
            onChange={(e) => setFirstLastName(e.target.value)}
            aria-invalid={!!fieldErrors.firstLastName}
          />
          {fieldErrors.firstLastName && <p className="field-error">{fieldErrors.firstLastName}</p>}
        </div>
        <div>
          <Input
            type="text"
            placeholder="Second last name (optional)"
            value={secondLastName}
            onChange={(e) => setSecondLastName(e.target.value)}
            aria-invalid={!!fieldErrors.secondLastName}
          />
          {fieldErrors.secondLastName && <p className="field-error">{fieldErrors.secondLastName}</p>}
        </div>
        <div>
          <Input
            type="tel"
            placeholder="Cellphone number"
            value={cellphoneNumber}
            onChange={(e) => setCellphoneNumber(e.target.value)}
            aria-invalid={!!fieldErrors.cellphoneNumber}
          />
          {fieldErrors.cellphoneNumber && <p className="field-error">{fieldErrors.cellphoneNumber}</p>}
        </div>
        <div className="auth-role">
          <label htmlFor="register-role">Role</label>
          <Select value={role} onValueChange={(value: string) => setRole(value as RoleValue)}>
            <SelectTrigger id="register-role" className="auth-role-select w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ROLE_USER">User</SelectItem>
              <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.role && <p className="field-error">{fieldErrors.role}</p>}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>

      <p className="auth-link-row">
        Already have an account? <Link to="/">Sign in</Link>
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  )
}
