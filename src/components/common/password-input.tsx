import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export function PasswordInput({ field, ...props } : any) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        {...field}
        {...props}
        type={show ? "text" : "password"}
        placeholder="Senha@123"
        style={{
          width: "100%",
          padding: "0.5rem 2.5rem 0.5rem 0.75rem",
          fontSize: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid #d1d5db",
          outline: "none",
        }}
        autoComplete="new-password"
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        style={{
          position: "absolute",
          top: "50%",
          right: "0.75rem",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "#6b7280",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        tabIndex={-1}
        aria-label={show ? "Ocultar senha" : "Exibir senha"}
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  )
}