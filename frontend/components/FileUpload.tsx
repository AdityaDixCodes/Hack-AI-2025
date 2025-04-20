import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '@/constants/colors';
import { FileText, Upload, X } from 'lucide-react-native';

interface FileUploadProps {
  onFileSelect: (file: DocumentPicker.DocumentPickerAsset | null) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedTypes = ['application/pdf'],
  maxSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedTypes,
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const selectedFile = result.assets[0];
      
      // Check file size if we have it
      if (selectedFile.size !== undefined && selectedFile.size > maxSize) {
        setError(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      onFileSelect(selectedFile);
    } catch (err) {
      console.error('Error picking document:', err);
      setError('Error selecting file. Please try again.');
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    onFileSelect(null);
  };

  return (
    <View style={styles.container}>
      {!file ? (
        <TouchableOpacity 
          style={styles.uploadArea} 
          onPress={handleFilePick}
          activeOpacity={0.7}
        >
          <Upload color={colors.primary} size={32} />
          <Text style={styles.uploadText}>
            Upload Financial Report
          </Text>
          <Text style={styles.uploadSubtext}>
            Tap to select a PDF file
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.filePreview}>
          <View style={styles.fileInfo}>
            <FileText color={colors.primary} size={24} />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.fileSize}>
                {file.size !== undefined ? (file.size / 1024).toFixed(1) : '?'} KB
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearFile} style={styles.removeButton}>
            <X color={colors.error} size={20} />
          </TouchableOpacity>
        </View>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight + '20',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  fileSize: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
  },
});