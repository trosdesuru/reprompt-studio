"use client";

import { Modal } from "@/src/system/molecules/Modal/Modal";
import { NeoIconBadge } from "@/src/system/atoms/Badge/NeoIconBadge";
import {
  IconCheck,
  IconX,
  IconInfoCircle,
  IconPhoto,
  IconBrandDiscord,
  IconDeviceDesktop,
} from "@tabler/icons-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ExtractorInfoModal({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-8 space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col items-center text-center space-y-4">
          <NeoIconBadge variant="info">
            <IconInfoCircle size={32} />
          </NeoIconBadge>
          <h2 className="text-xl font-black font-mono uppercase tracking-widest">
            ¿Cómo funciona la Extracción?
          </h2>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-md">
            Reprompt extrae los datos ocultos de tus imágenes IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna: SÍ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-bold font-mono text-xs uppercase tracking-tighter">
              <IconCheck size={18} stroke={3} /> Archivos soportados
            </div>
            <ul className="space-y-3">
              <InfoItem
                icon={<IconPhoto size={16} />}
                title="Archivos Originales"
                desc="Imágenes descargadas directamente de A1111, ComfyUI o Fooocus."
              />
              <InfoItem
                icon={<IconBrandDiscord size={16} />}
                title="Midjourney Original"
                desc="Descargas desde el bot de Discord o la web oficial de MJ."
              />
            </ul>
          </div>

          {/* Columna: NO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive font-bold font-mono text-xs uppercase tracking-tighter">
              <IconX size={18} stroke={3} /> Archivos sin metadata original
            </div>
            <ul className="space-y-3">
              <InfoItem
                icon={<IconDeviceDesktop size={16} />}
                title="Capturas de Pantalla"
                desc="Los screenshots destruyen toda la metadata del archivo original."
                isNegative
              />
              <InfoItem
                icon={<IconX size={16} />}
                title="Redes Sociales"
                desc="Instagram, Twitter o WhatsApp limpian los datos para ahorrar espacio."
                isNegative
              />
            </ul>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/40 p-4 rounded-lg">
          <p className="text-xs font-mono text-accent/40 leading-tight text-center uppercase">
            Si el archivo original no tiene metadata, siempre puedes introducir tu prompt a mano
            directamente en el Studio.
          </p>
        </div>
      </div>
    </Modal>
  );
}

function InfoItem({
  icon,
  title,
  desc,
  isNegative = false,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  isNegative?: boolean;
}) {
  return (
    <li className="flex gap-3 items-start">
      <div
        className={`p-1.5 rounded-md border ${isNegative ? "border-destructive/20 text-destructive" : "border-green-500/20 text-green-600"} bg-background shadow-sm`}
      >
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-foreground">{title}</h4>
        <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
      </div>
    </li>
  );
}
