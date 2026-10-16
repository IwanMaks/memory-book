import { hash, verify } from '@node-rs/argon2'
import type { PasswordHasher } from '../../core/ports/password-hasher'

/** argon2id с параметрами по умолчанию @node-rs/argon2 (рекомендации OWASP). */
export const argon2Hasher: PasswordHasher = {
  hash: (password) => hash(password),
  verify: (passwordHash, password) => verify(passwordHash, password),
}
