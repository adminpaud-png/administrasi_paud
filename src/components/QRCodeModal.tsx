import { QRCodeSVG } from "qrcode.react";
import { Dialog } from "./ui/dialog";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  subtitle?: string;
}

export function QRCodeModal({ isOpen, onClose, title, value, subtitle }: QRCodeModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center justify-center py-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <QRCodeSVG value={value} size={200} level="H" includeMargin />
        </div>
        <p className="mt-6 text-center font-mono text-xl font-bold text-slate-800 tracking-wider bg-slate-100 px-4 py-1.5 rounded-lg border border-slate-200">{value}</p>
        {subtitle && <p className="text-sm font-medium text-slate-500 mt-3 text-center">{subtitle}</p>}
      </div>
    </Dialog>
  );
}
