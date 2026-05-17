import { forwardRef, useImperativeHandle, useRef, useState } from "react";

import { uploadFileToStorage, type StorageFile } from "../../api/fileService";

import { Button } from "./button";

import { CheckCircle, FileText, Loader2, Upload, X } from "lucide-react";

import { toast } from "sonner";



export interface UploadedStorageFile {

  blobName: string;

  displayName: string;

  size: number;

}



export interface StorageFileUploadHandle {

  openFilePicker: () => void;

}



interface StorageFileUploadProps {

  folder?: string;

  accept?: string;

  maxSizeMb?: number;

  hint?: string;

  value?: UploadedStorageFile | null;

  onChange?: (file: UploadedStorageFile | null) => void;

  disabled?: boolean;

}



function formatFileSize(bytes: number): string {

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}



export const StorageFileUpload = forwardRef<

  StorageFileUploadHandle,

  StorageFileUploadProps

>(function StorageFileUpload(

  {

    folder,

    accept = "*/*",

    maxSizeMb = 50,

    hint,

    value,

    onChange,

    disabled = false,

  },

  ref

) {

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);



  useImperativeHandle(ref, () => ({

    openFilePicker: () => {

      if (!disabled && !uploading) {

        inputRef.current?.click();

      }

    },

  }));



  const toUploaded = (stored: StorageFile, originalName: string): UploadedStorageFile => ({

    blobName: stored.name,

    displayName: originalName,

    size: stored.size,

  });



  const handleSelect = async (files: FileList | null) => {

    const file = files?.[0];

    if (!file) return;



    const maxBytes = maxSizeMb * 1024 * 1024;

    if (file.size > maxBytes) {

      toast.error(`File must be smaller than ${maxSizeMb} MB`);

      return;

    }



    setUploading(true);

    try {

      const stored = await uploadFileToStorage(file, folder);

      onChange?.(toUploaded(stored, file.name));

      toast.success("File uploaded");

    } catch (error) {

      toast.error(error instanceof Error ? error.message : "Upload failed");

    } finally {

      setUploading(false);

      if (inputRef.current) inputRef.current.value = "";

    }

  };



  const clear = () => {

    onChange?.(null);

    if (inputRef.current) inputRef.current.value = "";

  };



  const openPicker = () => inputRef.current?.click();



  return (

    <div className="space-y-4">

      <input

        ref={inputRef}

        type="file"

        accept={accept}

        className="hidden"

        disabled={disabled || uploading}

        onChange={(event) => handleSelect(event.target.files)}

      />



      {!value ? (

        <div

          role="button"

          tabIndex={disabled || uploading ? -1 : 0}

          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"

          onClick={() => !disabled && !uploading && openPicker()}

          onKeyDown={(e) => {

            if (e.key === "Enter" || e.key === " ") {

              e.preventDefault();

              if (!disabled && !uploading) openPicker();

            }

          }}

        >

          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />

          <p className="text-sm font-medium">Click to upload or drag and drop</p>

          {hint && (

            <p className="text-xs text-muted-foreground mt-1">{hint}</p>

          )}

          <Button

            type="button"

            variant="outline"

            className="mt-4"

            disabled={disabled || uploading}

            onClick={(e) => {

              e.stopPropagation();

              openPicker();

            }}

          >

            {uploading ? (

              <>

                <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                Uploading...

              </>

            ) : (

              <>

                <Upload className="w-4 h-4 mr-2" />

                Choose file

              </>

            )}

          </Button>

        </div>

      ) : (

        <div className="bg-muted/50 rounded-lg p-4 space-y-3">

          <div className="flex items-start justify-between gap-3">

            <div className="flex items-center gap-3 min-w-0">

              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">

                <FileText className="w-5 h-5 text-blue-600" />

              </div>

              <div className="min-w-0">

                <p className="text-sm truncate">{value.displayName}</p>

                <p className="text-xs text-muted-foreground">

                  {formatFileSize(value.size)}

                </p>

              </div>

            </div>

            <Button

              type="button"

              variant="ghost"

              size="sm"

              disabled={disabled || uploading}

              onClick={clear}

              className="text-muted-foreground hover:text-destructive shrink-0"

            >

              <X className="w-4 h-4" />

            </Button>

          </div>

          <div className="flex justify-between items-center gap-2 flex-wrap">

            <span className="text-xs text-green-600 flex items-center gap-1">

              <CheckCircle className="w-3 h-3" />

              Saved to cloud storage

            </span>

            <Button

              type="button"

              variant="outline"

              size="sm"

              disabled={disabled || uploading}

              onClick={openPicker}

            >

              Replace file

            </Button>

          </div>

        </div>

      )}

    </div>

  );

});


