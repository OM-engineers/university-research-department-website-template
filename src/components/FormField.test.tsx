import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { FormField } from './FormField'

afterEach(cleanup)

describe('FormField', () => {
  it('renders a default input with a label', () => {
    render(<FormField label="First Name" />)
    expect(screen.getByText('First Name')).toBeTruthy()
    const input = screen.getByRole('textbox')
    expect(input.tagName).toBe('INPUT')
  })

  it('renders a textarea when type is "textarea"', () => {
    render(<FormField label="Message" type="textarea" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('renders a checkbox when type is "checkbox"', () => {
    render(<FormField label="Accept terms" type="checkbox" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox.tagName).toBe('INPUT')
    expect(screen.getByText('Accept terms')).toBeTruthy()
  })

  it('shows a required asterisk and sets required attribute when required is true', () => {
    render(<FormField label="Email" required />)
    expect(screen.getByText('*')).toBeTruthy()
    expect(screen.getByRole('textbox').hasAttribute('required')).toBe(true)
  })

  it('shows the error message', () => {
    render(<FormField label="Password" error="Password is too short" />)
    expect(screen.getByText('Password is too short')).toBeTruthy()
  })

  it('shows the success message and prioritizes error over success', () => {
    render(<FormField label="Username" success="Username is available" />)
    expect(screen.getByText('Username is available')).toBeTruthy()
    cleanup()
    
    render(<FormField label="Username" error="Invalid format" success="Looks good" />)
    expect(screen.getByText('Invalid format')).toBeTruthy()
    expect(screen.queryByText('Looks good')).toBeNull()
  })

  it('passes standard HTML attributes to the underlying element', () => {
    render(
      <FormField 
        label="Biography" 
        placeholder="Tell us about yourself" 
        defaultValue="I am a developer" 
        disabled 
      />
    )
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.placeholder).toBe('Tell us about yourself')
    expect(input.value).toBe('I am a developer')
    expect(input.disabled).toBe(true)
  })
  describe('FormField accessibility', () => {
    it('links the label to the field', () => {
      render(<FormField label="Email" />)
      expect(screen.getByLabelText(/Email/)).toBeTruthy()
    })
  
  
    it('links the error message to the field', () => {
      render(<FormField label="Name" error="Please enter your name." />)
      const input = screen.getByLabelText(/Name/)
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toBe(screen.getByText('Please enter your name.').id)
    })
  })
})