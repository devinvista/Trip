#!/usr/bin/env node

/**
 * Script de verificação de compatibilidade MySQL
 * Verifica se há uso indevido de .returning() no código
 */

import fs from 'fs';
import path from 'path';

// Diretórios para verificar
const directories = ['server', 'client', 'shared'];

// Extensões de arquivo para verificar
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Função para verificar se um arquivo deve ser processado
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return extensions.includes(ext);
}

// Função recursiva para buscar arquivos
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Pular node_modules
      if (file !== 'node_modules') {
        findFiles(filePath, fileList);
      }
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Função para verificar um arquivo
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, index) => {
    if (line.includes('.returning(')) {
      issues.push({
        file: filePath,
        line: index + 1,
        content: line.trim(),
        issue: 'Uso de .returning() - não suportado no MySQL'
      });
    }
  });
  
  return issues;
}

// Função principal
function main() {
  console.log('🔍 Verificando compatibilidade MySQL...\n');
  
  let totalIssues = 0;
  let allIssues = [];
  
  // Verificar cada diretório
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`📁 Verificando diretório: ${dir}`);
      
      const files = findFiles(dir);
      console.log(`   Arquivos encontrados: ${files.length}`);
      
      files.forEach(file => {
        const issues = checkFile(file);
        if (issues.length > 0) {
          allIssues.push(...issues);
          totalIssues += issues.length;
        }
      });
      
      console.log(`   Problemas encontrados: ${allIssues.filter(i => i.file.startsWith(dir)).length}`);
    } else {
      console.log(`⚠️  Diretório não encontrado: ${dir}`);
    }
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (totalIssues === 0) {
    console.log('✅ Nenhum problema de compatibilidade encontrado!');
    console.log('✅ Código totalmente compatível com MySQL');
  } else {
    console.log(`❌ ${totalIssues} problema(s) encontrado(s):\n`);
    
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.file}:${issue.line}`);
      console.log(`   Problema: ${issue.issue}`);
      console.log(`   Código: ${issue.content}`);
      console.log();
    });
    
    console.log('💡 Consulte o arquivo MYSQL_DEVELOPMENT_GUIDE.md para correções');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resumo: ${totalIssues} problemas em ${directories.length} diretórios`);
  console.log(`📅 Verificação executada em: ${new Date().toLocaleString('pt-BR')}`);
  
  // Retornar código de saída apropriado
  process.exit(totalIssues > 0 ? 1 : 0);
}

// Executar script
main();