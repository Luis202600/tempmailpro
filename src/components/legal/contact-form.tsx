"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

/**
 * Formulario de contacto sin backend: compone un email vía mailto: con
 * los datos introducidos. Funciona en móvil y escritorio con el cliente
 * de correo predeterminado.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubject = encodeURIComponent(
      `[TempMail Pro] ${subject.trim()}`
    );
    const body = encodeURIComponent(
      `${message}\n\n—\nEnviado por: ${name || "(sin nombre)"}\nEmail de respuesta: ${email}`
    );
    window.location.href = `mailto:freetoolsstudio@gmail.com?subject=${finalSubject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Nombre</Label>
          <Input
            id="contact-name"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email de respuesta</Label>
          <Input
            id="contact-email"
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject">Asunto</Label>
        <Input
          id="contact-subject"
          required
          maxLength={120}
          placeholder="Resume tu consulta (p. ej., No recibo correos en mi dirección)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Mensaje</Label>
        <Textarea
          id="contact-message"
          required
          rows={5}
          placeholder="Cuéntanos qué necesitas…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button type="submit" className="gap-2">
        <Send className="h-4 w-4" />
        Enviar mensaje
      </Button>
      <p className="text-xs text-muted-foreground">
        Al enviar se abrirá tu aplicación de correo con el mensaje ya redactado
        dirigido a freetoolsstudio@gmail.com.
      </p>
    </form>
  );
}
