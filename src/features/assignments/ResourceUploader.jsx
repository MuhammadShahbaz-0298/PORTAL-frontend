/* ResourceUploader: attach files with every validation error shown inline. */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Paperclip } from "lucide-react";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import { env } from "../../config/env";

const extensionOf = name => {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot).toLowerCase();
};

export function validateResourceFile(file, existingCount) {
  if (!file) return "Choose a file to attach.";
  if (!env.allowedResourceExtensions.includes(extensionOf(file.name))) {
    return `Allowed file types: ${env.allowedResourceExtensions.join(", ")}.`;
  }
  if (file.size > env.maxResourceSizeMb * 1024 * 1024) {
    return `Files must be ${env.maxResourceSizeMb} MB or smaller.`;
  }
  if (existingCount >= env.maxResourceCount) {
    return `This assignment already has the maximum of ${env.maxResourceCount} resources.`;
  }
  return "";
}

export default function ResourceUploader({
  assignmentId,
  selectedFiles = [],
  onFilesChange,
  disabled = false,
}) {
  const dispatch = useDispatch();
  const { uploading, uploadError, items } = useSelector(
    state => state.assignmentResources
  );
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const collecting = typeof onFilesChange === "function";
  const message = error || uploadError;

  const pickFile = event => {
    const next = collecting
      ? Array.from(event.target.files || [])
      : event.target.files?.[0] || null;
    setFile(next);
    setError("");
    dispatch.assignmentResources.setUploadError("");
  };

  const submit = async () => {
    if (collecting) {
      const picked = Array.isArray(file) ? file : [];
      if (!picked.length) {
        setError("Choose at least one file to attach.");
        return;
      }
      const rejected = [];
      const accepted = [];
      picked.forEach(candidate => {
        const problem = validateResourceFile(
          candidate,
          selectedFiles.length + accepted.length
        );
        if (problem) rejected.push(`${candidate.name}: ${problem}`);
        else accepted.push(candidate);
      });
      if (accepted.length) onFilesChange([...selectedFiles, ...accepted]);
      setError(rejected.join(" "));
      setInputKey(current => current + 1);
      setFile(null);
      return;
    }

    const problem = validateResourceFile(file, items.length);
    if (problem) {
      setError(problem);
      return;
    }

    const uploaded = await dispatch.assignmentResources.upload({
      assignmentId,
      file,
    });
    if (uploaded) {
      setFile(null);
      setInputKey(current => current + 1);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <FormField
        label="Attach a resource"
        htmlFor={collecting ? "draft-resource-file" : "resource-file"}
        hint={`${env.allowedResourceExtensions.join(", ")} · up to ${env.maxResourceSizeMb} MB · max ${env.maxResourceCount} files`}
        error={message}
      >
        <Input
          key={inputKey}
          id={collecting ? "draft-resource-file" : "resource-file"}
          type="file"
          multiple={collecting}
          accept={env.allowedResourceExtensions.join(",")}
          disabled={disabled || uploading}
          invalid={Boolean(message)}
          onChange={pickFile}
          className="py-2 text-sm"
        />
      </FormField>
      <Button
        type="button"
        onClick={submit}
        loading={uploading}
        disabled={disabled || uploading}
        className="mt-2"
      >
        <Paperclip size={15} aria-hidden="true" />
        {collecting ? "Add files" : "Attach resource"}
      </Button>
    </div>
  );
}
