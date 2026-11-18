// The kit's texts are the Vietnamese source strings: run the tests in Vietnamese whatever the machine's language.
localStorage.setItem('bonbon.locale', 'vi')
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())
