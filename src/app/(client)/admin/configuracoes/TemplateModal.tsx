/* src/app/(client)/admin/configuracoes/TemplateModal.tsx */
'use client';

import { useState } from 'react';
import { createTemplate, updateTemplate, deleteTemplate } from '@/lib/actions/admin';

export default function TemplateModal({
  isOpen,
  onClose,
  editingTemplate,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingTemplate?: { id: string; nome: string; descricao?: string; perguntas_json: string } | null;
}) {
  const [state, action, pending] = useActionState(
    async (prev: any, formData: FormData) => {
      const isEdit = !!formData.get('id');
      const res = isEdit ? await updateTemplate(prev, formData) : await createTemplate(prev, formData);
      if (res?.success) {
        onClose();
      }
      return res;
    },
    undefined
  );

  const handleDelete = async () => {
    if (!editingTemplate?.id) return;
    const formData = new FormData();
    formData.append('id', editingTemplate.id);
    const res = await deleteTemplate(undefined, formData);
    if (res?.success) {
      onClose();
    }
  };

  const defaultValues = editingTemplate || {
    id: '',
    nome: '',
    descricao: '',
    perguntas_json: '[]',
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">
          {editingTemplate ? 'Editar Modelo de Formulário' : 'Criar Modelo de Formulário'}
        </h3>
        <form action={action} className="space-y-4">
          {editingTemplate && <input type="hidden" name="id" value={defaultValues.id} />}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nome">
              Nome do Modelo *
            </label>
            <input
              id="nome"
              name="nome"
              required
              defaultValue={defaultValues.nome}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              placeholder="Ex: Avaliação Inicial"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="descricao">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              defaultValue={defaultValues.descricao}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="perguntas_json">
              Perguntas (JSON)
            </label>
            <textarea
              id="perguntas_json"
              name="perguntas_json"
              required
              defaultValue={defaultValues.perguntas_json}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono"
              rows={5}
              placeholder='[{"label":"Nome","type":"text","required":true}]'
            />
            <p className="text-xs text-zinc-500 mt-1">
              Forneça as perguntas em formato JSON. Cada objeto deve conter ao menos `label` e `type`.
            </p>
          </div>
          {state?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-2 rounded">
              {state.error}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            {editingTemplate && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                disabled={pending}
              >
                Excluir
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              disabled={pending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#E1A293] text-white hover:bg-[#d48d7c]"
              disabled={pending}
            >
              {pending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
