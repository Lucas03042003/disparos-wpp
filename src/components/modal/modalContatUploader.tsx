import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import ExcelJS from "exceljs";

export interface Contact {
  id: string;
  name: string;
  phone_number: string;
}

interface ContactsUploaderProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
}

export function ContactsUploader({
  contacts,
  onContactsChange,
}: ContactsUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: "name" | "phone_number";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const parseFile = useCallback(
    async (file: File): Promise<Contact[] | null> => {
      const extension = file.name.split(".").pop()?.toLowerCase();

      try {
        if (extension === "xlsx" || extension === "xls") {
          return parseExcel(file);
        } else if (extension === "csv") {
          return parseCSV(file);
        } else if (extension === "txt") {
          return parseTXT(file);
        } else {
          toast.error("Formato não suportado", {
            description: "Use arquivos .xlsx, .csv ou .txt",
          });
          return null;
        }
      } catch (error) {
        console.error("Erro no processamento:", error);
        toast.error("Erro ao processar arquivo", {
          description: "Verifique se o arquivo está no formato correto",
        });
        return null;
      }
    },
    []
  );

  const parseExcel = async (file: File): Promise<Contact[] | null> => {
    const data = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);
    
    // Obtém a primeira aba (ExcelJS usa indexação baseada em 1)
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) return null;

    const jsonData: Record<string, unknown>[] = [];
    const headers: string[] = [];

    // Mapeia os cabeçalhos da primeira linha
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber] = String(cell.value || "").trim();
    });

    // Itera pelas linhas de dados (começando da 2)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      
      const rowObject: Record<string, unknown> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          let value = cell.value;
          
          // Trata casos onde o valor pode ser um objeto (fórmula ou RichText)
          if (value && typeof value === "object") {
            if ("result" in value) value = value.result;
            else if ("text" in value) value = (value as any).text;
          }
          
          rowObject[header] = value;
        }
      });
      jsonData.push(rowObject);
    });

    return validateAndTransform(jsonData);
  };

  const parseCSV = async (file: File): Promise<Contact[] | null> => {
    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      toast.error("Arquivo vazio", {
        description: "O arquivo deve conter cabeçalho e pelo menos uma linha de dados",
      });
      return null;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });
      return obj;
    });

    return validateAndTransform(data);
  };

  const parseTXT = async (file: File): Promise<Contact[] | null> => {
    const text = await file.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      toast.error("Arquivo vazio", {
        description: "O arquivo deve conter cabeçalho e pelo menos uma linha de dados",
      });
      return null;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });
      return obj;
    });

    return validateAndTransform(data);
  };

  const validateAndTransform = (
    data: Record<string, unknown>[]
  ): Contact[] | null => {
    if (data.length === 0) {
      toast.error("Arquivo vazio", {
        description: "O arquivo não contém dados",
      });
      return null;
    }

    const firstRow = data[0];
    const keys = Object.keys(firstRow).map((k) => k.toLowerCase());

    const hasName = keys.includes("name");
    const hasPhone = keys.includes("phone_number");

    if (!hasName || !hasPhone) {
      const missing: string[] = [];
      if (!hasName) missing.push('"name"');
      if (!hasPhone) missing.push('"phone_number"');

      toast.error("Colunas obrigatórias ausentes", {
        description: `O arquivo deve conter as colunas: ${missing.join(" e ")}`,
      });
      return null;
    }

    const contacts: Contact[] = data.map((row) => {
      const normalizedRow: Record<string, unknown> = {};
      Object.keys(row).forEach((key) => {
        normalizedRow[key.toLowerCase()] = row[key];
      });

      return {
        id: generateId(),
        name: String(normalizedRow["name"] || "").trim(),
        phone_number: String(normalizedRow["phone_number"] || "").trim(),
      };
    });

    // Filter out empty rows
    const validContacts = contacts.filter(
      (c) => c.name !== "" || c.phone_number !== ""
    );

    if (validContacts.length === 0) {
      toast.error("Nenhum contato válido", {
        description: "O arquivo não contém contatos válidos",
      });
      return null;
    }

    return validContacts;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        const newContacts = await parseFile(file);
        if (newContacts) {
          onContactsChange([...contacts, ...newContacts]);
          toast.success(`${newContacts.length} contatos adicionados`);
        }
      }
    },
    [contacts, onContactsChange, parseFile]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const newContacts = await parseFile(file);
        if (newContacts) {
          onContactsChange([...contacts, ...newContacts]);
          toast.success(`${newContacts.length} contatos adicionados`);
        }
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [contacts, onContactsChange, parseFile]
  );

  const handleDeleteContact = useCallback(
    (id: string) => {
      onContactsChange(contacts.filter((c) => c.id !== id));
    },
    [contacts, onContactsChange]
  );

  const handleAddContact = useCallback(() => {
    const newContact: Contact = {
      id: generateId(),
      name: "",
      phone_number: "",
    };
    onContactsChange([...contacts, newContact]);
  }, [contacts, onContactsChange]);

  const handleCellEdit = useCallback(
    (id: string, field: "name" | "phone_number", value: string) => {
      onContactsChange(
        contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    },
    [contacts, onContactsChange]
  );

  const handleClearAll = useCallback(() => {
    onContactsChange([]);
  }, [onContactsChange]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div
            className={`
              p-3 rounded-full transition-colors
              ${isDragging ? "bg-primary/10" : "bg-muted"}
            `}
          >
            <Upload
              className={`h-6 w-6 ${
                isDragging ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          <div>
            <p className="font-medium text-sm">
              {isDragging
                ? "Solte o arquivo aqui"
                : "Arraste um arquivo ou clique para selecionar"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos: .xlsx, .csv, .txt (para .csv e .txt, separe as colunas por vírgula)
            </p>
          </div>
        </div>
      </div>

      {/* File Structure Info */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
        <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            Estrutura obrigatória do arquivo:
          </p>
          <div className="flex items-center gap-4">
            <FileSpreadsheet className="h-8 w-8 text-primary/60" />
            <div className="font-mono text-xs bg-background rounded px-2 py-1 border">
              <div className="flex gap-4 border-b pb-1 mb-1 font-semibold">
                <span>name</span>
                <span>phone_number</span>
              </div>
              <div className="flex gap-4 text-muted-foreground">
                <span>João Silva</span>
                <span>5511999999999</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium">{contacts.length} contato(s)</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddContact}
                className="h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                Limpar tudo
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[200px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Nome</TableHead>
                  <TableHead className="w-[45%]">Telefone</TableHead>
                  <TableHead className="w-[10%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="py-1">
                      {editingCell?.id === contact.id &&
                      editingCell?.field === "name" ? (
                        <Input
                          autoFocus
                          value={contact.name}
                          onChange={(e) =>
                            handleCellEdit(contact.id, "name", e.target.value)
                          }
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingCell(null);
                          }}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <span
                          onClick={() =>
                            setEditingCell({ id: contact.id, field: "name" })
                          }
                          className="cursor-pointer hover:bg-muted px-2 py-1 rounded inline-block min-w-[100px]"
                        >
                          {contact.name || (
                            <span className="text-muted-foreground italic">
                              vazio
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-1">
                      {editingCell?.id === contact.id &&
                      editingCell?.field === "phone_number" ? (
                        <Input
                          autoFocus
                          value={contact.phone_number}
                          onChange={(e) =>
                            handleCellEdit(
                              contact.id,
                              "phone_number",
                              e.target.value
                            )
                          }
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingCell(null);
                          }}
                          className="h-7 text-sm"
                        />
                      ) : (
                        <span
                          onClick={() =>
                            setEditingCell({
                              id: contact.id,
                              field: "phone_number",
                            })
                          }
                          className="cursor-pointer hover:bg-muted px-2 py-1 rounded inline-block min-w-[100px]"
                        >
                          {contact.phone_number || (
                            <span className="text-muted-foreground italic">
                              vazio
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Add more files */}
          <p className="text-xs text-muted-foreground text-center">
            Você pode adicionar mais arquivos para concatenar contatos
          </p>
        </div>
      )}
    </div>
  );
}