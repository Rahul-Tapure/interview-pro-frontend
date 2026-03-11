// code-editor.ts
import {
  Component, ElementRef, EventEmitter, Input,
  OnDestroy, OnInit, Output, ViewChild,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as monaco from 'monaco-editor';

interface Judge0Language {
  id: number;
  name: string;
  monaco?: string; // Monaco editor language mode
}

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  styleUrls: ['./code-editor.css'],
  template: `
<div class="editor-root">

  <!-- ── Toolbar ── -->
  <div class="editor-toolbar">
    
    <div class="lang-select-wrap">
      <span class="lang-label">Language</span>
      <select
        class="lang-select"
        [(ngModel)]="selectedLanguageId"
        (change)="onLanguageChange()"
        [disabled]="loadingLanguages">
        <option value="" disabled>{{ loadingLanguages ? 'Loading...' : 'Select Language' }}</option>
        <option *ngFor="let lang of languages" [value]="lang.id">
          {{ lang.name }}
        </option>
      </select>
    </div>

    <div class="toolbar-actions">
      <button class="btn-run" (click)="runCode()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Run
      </button>

      <button class="btn-submit" (click)="submitCode()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
        </svg>
        Submit
      </button>
    </div>

  </div>

  <!-- ── Monaco Editor ── -->
  <div #editorContainer class="editor-container"></div>

  <!-- ── Console Panel ── -->
  <div class="console-panel">
    <div class="console-header">
      <div class="console-title">
        <svg class="console-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
        Console Output
      </div>
      <button class="console-clear" (click)="clearConsole()" title="Clear console">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
      </button>
    </div>
    <div class="console-body">

    <!-- Submit Result -->
<div *ngIf="isSubmitResult" class="output-section">

  <div class="status-row">
    <span class="status-badge"
      [class.status-accepted]="parsedOutput.status === 'PASSED'"
      [class.status-error]="parsedOutput.status === 'FAILED' || parsedOutput.status === 'ERROR'">
      {{ parsedOutput.status }}
    </span>

    <span class="meta-chip">
      Passed: {{ parsedOutput.passed }} / {{ parsedOutput.total }}
    </span>

  </div>

  <div *ngIf="parsedOutput.message">
    <div class="output-label">Message</div>
    <pre class="output-content">{{ parsedOutput.message }}</pre>
  </div>

</div>

<!-- run -->
      <pre class="console-placeholder" *ngIf="!consoleOutput">Run or submit code to see output...</pre>
      
      <!-- Rich Output (parsed JSON) -->
      <div *ngIf="consoleOutput && parsedOutput && !isSubmitResult" class="output-section">
        
        <!-- Status + Meta Row -->
        <div class="status-row">
          <span class="status-badge"
            [class.status-accepted]="parsedOutput.status?.id === 3"
            [class.status-error]="parsedOutput.status?.id !== 3 && parsedOutput.status?.id > 3"
            [class.status-timeout]="parsedOutput.status?.id === 5"
            [class.status-runtime-error]="parsedOutput.status?.id === 11 || parsedOutput.status?.id === 12">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline *ngIf="parsedOutput.status?.id === 3" points="20 6 9 17 4 12"/>
              <line *ngIf="parsedOutput.status?.id !== 3" x1="18" y1="6" x2="6" y2="18"/>
              <line *ngIf="parsedOutput.status?.id !== 3" x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            {{ parsedOutput.status?.description || 'Unknown' }}
          </span>
          
          <span class="meta-chip" *ngIf="parsedOutput.time !== undefined">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {{ parsedOutput.time }}s
          </span>
          
          <span class="meta-chip" *ngIf="parsedOutput.memory !== undefined">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
            {{ (parsedOutput.memory / 1024).toFixed(2) }} MB
          </span>
        </div>

        <!-- Stdout -->
        <div *ngIf="parsedOutput.stdout">
          <div class="output-label">Output</div>
          <pre class="output-content">{{ parsedOutput.stdout }}</pre>
        </div>

        <!-- Stderr -->
        <div *ngIf="parsedOutput.stderr">
          <div class="output-label">Error Output</div>
          <pre class="stderr-content">{{ parsedOutput.stderr }}</pre>
        </div>

        <!-- Compile Output -->
        <div *ngIf="parsedOutput.compile_output">
          <div class="output-label">Compilation Error</div>
          <pre class="compile-error-content">{{ parsedOutput.compile_output }}</pre>
        </div>

        <!-- Message -->
        <div *ngIf="parsedOutput.message">
          <div class="output-label">Message</div>
          <pre class="output-content">{{ parsedOutput.message }}</pre>
        </div>

      </div>

      <!-- Fallback: Plain Text Output -->
      <pre class="console-output" *ngIf="consoleOutput && !parsedOutput">{{ consoleOutput }}</pre>
    </div>
  </div>

</div>
  `,
})
export class CodeEditorComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('editorContainer', { static: true })
  editorContainer!: ElementRef;

  @Input() initialCode: string = '';
  @Input() consoleOutput: string = '';

  @Output() run    = new EventEmitter<string>();
  @Output() submit = new EventEmitter<string>();
  @Output() languageIdChange = new EventEmitter<number>(); // Emit Judge0 language ID

  editor!: monaco.editor.IStandaloneCodeEditor;
  code: string = '';
  selectedLanguageId: number = 62; // Default: Java (Judge0 ID)
  
  languages: Judge0Language[] = [];
  loadingLanguages = true;

  /** 
   * Template map: Judge0 ID → starter code
   * Add templates for common languages you support
   */
  private languageTemplates: Record<number, string> = {
    // Java (62 - OpenJDK 13.0.1)
    62: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, InterviewPro!");
  }
}`,
    
    // JavaScript (63 - Node.js 12.14.0)
    63: `console.log("Hello, InterviewPro!");`,
    
    // Python 3 (71 - Python 3.8.1)
    71: `print("Hello, InterviewPro!")`,
    
    // Python 2 (70 - Python 2.7.17)
    70: `print "Hello, InterviewPro!"`,
    
    // C++ GCC 9.2.0 (54)
    54: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, InterviewPro!" << endl;
  return 0;
}`,
    
    // C++ GCC 8.3.0 (53)
    53: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, InterviewPro!" << endl;
  return 0;
}`,
    
    // C++ Clang 7.0.1 (76)
    76: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello, InterviewPro!" << endl;
  return 0;
}`,
    
    // C GCC 9.2.0 (50)
    50: `#include <stdio.h>

int main() {
  printf("Hello, InterviewPro!\\n");
  return 0;
}`,
    
    // C GCC 8.3.0 (49)
    49: `#include <stdio.h>

int main() {
  printf("Hello, InterviewPro!\\n");
  return 0;
}`,
    
    // C Clang 7.0.1 (75)
    75: `#include <stdio.h>

int main() {
  printf("Hello, InterviewPro!\\n");
  return 0;
}`,
    
    // C# (51 - Mono 6.6.0.161)
    51: `using System;

class Program {
  static void Main() {
    Console.WriteLine("Hello, InterviewPro!");
  }
}`,
    
    // Go (60 - 1.13.5)
    60: `package main

import "fmt"

func main() {
  fmt.Println("Hello, InterviewPro!")
}`,
    
    // Ruby (72 - 2.7.0)
    72: `puts "Hello, InterviewPro!"`,
    
    // Rust (73 - 1.40.0)
    73: `fn main() {
  println!("Hello, InterviewPro!");
}`,
    
    // TypeScript (74 - 3.7.4)
    74: `console.log("Hello, InterviewPro!");`,
    
    // Kotlin (78 - 1.3.70)
    78: `fun main() {
  println("Hello, InterviewPro!")
}`,
    
    // Swift (83 - 5.2.3)
    83: `print("Hello, InterviewPro!")`,
    
    // PHP (68 - 7.4.1)
    68: `<?php
echo "Hello, InterviewPro!\\n";
?>`,
    
    // Bash (46 - 5.0.0)
    46: `#!/bin/bash
echo "Hello, InterviewPro!"`,
  };

  /**
   * Map Judge0 language names → Monaco editor modes
   * Monaco supports: javascript, typescript, java, python, cpp, csharp, go, ruby, rust, php, etc.
   */
  private monacoModeMap: Record<string, string> = {
    'JavaScript': 'javascript',
    'TypeScript': 'typescript',
    'Java': 'java',
    'Python': 'python',
    'C++': 'cpp',
    'C': 'c',
    'C#': 'csharp',
    'Go': 'go',
    'Ruby': 'ruby',
    'Rust': 'rust',
    'Kotlin': 'kotlin',
    'Swift': 'swift',
    'PHP': 'php',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLanguagesFromJudge0();
    this.code = this.initialCode || this.getTemplateCode(this.selectedLanguageId);
    this.initEditor();
  }

  /** Load languages from backend (which fetches from Judge0) */
  loadLanguagesFromJudge0(): void {
    this.http.get<Judge0Language[]>('http://localhost:8080/interviewpro/coding/languages')
      .subscribe({
        next: (langs) => {
          // Add Monaco mode mapping
          this.languages = langs.map(lang => ({
            ...lang,
            monaco: this.getMonacoMode(lang.name)
          }));
          this.loadingLanguages = false;
        },
        error: () => {
          // Fallback to hardcoded popular languages if backend fails
          this.languages = [
            { id: 62, name: 'Java', monaco: 'java' },
            { id: 63, name: 'JavaScript (Node.js)', monaco: 'javascript' },
            { id: 71, name: 'Python (3.8.1)', monaco: 'python' },
            { id: 54, name: 'C++ (GCC 9.2.0)', monaco: 'cpp' },
            { id: 50, name: 'C (GCC 9.2.0)', monaco: 'c' },
            { id: 51, name: 'C# (Mono 6.6.0.161)', monaco: 'csharp' },
            { id: 60, name: 'Go (1.13.5)', monaco: 'go' },
          ];
          this.loadingLanguages = false;
          console.error('Failed to load languages from backend, using fallback');
        }
      });
  }

  /** Initialize Monaco editor */
  initEditor(): void {
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.code,
      language: this.getMonacoMode(this.getLanguageName(this.selectedLanguageId)),
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      smoothScrolling: true,
    });

    this.editor.onDidChangeModelContent(() => {
      this.code = this.editor.getValue();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialCode'] && this.editor) {
      const langName = this.getLanguageName(this.selectedLanguageId);
      const model = monaco.editor.createModel(
        this.initialCode, 
        this.getMonacoMode(langName)
      );
      this.editor.setModel(model);
      this.code = this.initialCode;
    }
  }

  runCode(): void {
    this.run.emit(this.code);
    this.languageIdChange.emit(this.selectedLanguageId);
  }

  submitCode(): void {
    this.submit.emit(this.code);
    this.languageIdChange.emit(this.selectedLanguageId);
  }

  clearConsole(): void {
    this.consoleOutput = '';
  }

  onLanguageChange(): void {
    // Convert to number (dropdown returns string)
    this.selectedLanguageId = Number(this.selectedLanguageId);
    
    const newCode = this.getTemplateCode(this.selectedLanguageId);
    const langName = this.getLanguageName(this.selectedLanguageId);
    const model = monaco.editor.createModel(newCode, this.getMonacoMode(langName));
    this.editor.setModel(model);
    this.code = newCode;
    this.languageIdChange.emit(this.selectedLanguageId);
  }

  /** Get template code for a Judge0 language ID */
  getTemplateCode(languageId: number): string {
    // Return template if exists
    if (this.languageTemplates[languageId]) {
      return this.languageTemplates[languageId];
    }
    
    // Generic fallback for unsupported languages
    const langName = this.getLanguageName(languageId);
    return `// ${langName} starter code\n// Write your solution here\n`;
  }

  /** Get language name from Judge0 ID */
  getLanguageName(languageId: number): string {
    const lang = this.languages.find(l => l.id === languageId);
    return lang?.name || 'Unknown';
  }

  /**
   * Map Judge0 language names → Monaco editor modes
   * Monaco supports: javascript, typescript, java, python, cpp, csharp, go, ruby, rust, php, etc.
   * Use partial matching for language names with versions
   */
  getMonacoMode(languageName: string): string {
    // Direct match first
    if (this.monacoModeMap[languageName]) {
      return this.monacoModeMap[languageName];
    }
    
    // Partial match for versioned languages (e.g. "Python (3.8.1)" → "python")
    const normalized = languageName.toLowerCase();
    if (normalized.includes('javascript') || normalized.includes('node')) return 'javascript';
    if (normalized.includes('typescript')) return 'typescript';
    if (normalized.includes('java') && !normalized.includes('javascript')) return 'java';
    if (normalized.includes('python')) return 'python';
    if (normalized.includes('c++')) return 'cpp';
    if (normalized.includes('c#')) return 'csharp';
    if (normalized.includes('c (')) return 'c';
    if (normalized.includes('go')) return 'go';
    if (normalized.includes('ruby')) return 'ruby';
    if (normalized.includes('rust')) return 'rust';
    if (normalized.includes('kotlin')) return 'kotlin';
    if (normalized.includes('swift')) return 'swift';
    if (normalized.includes('php')) return 'php';
    if (normalized.includes('sql')) return 'sql';
    if (normalized.includes('bash') || normalized.includes('shell')) return 'shell';
    if (normalized.includes('r (')) return 'r';
    if (normalized.includes('scala')) return 'scala';
    if (normalized.includes('perl')) return 'perl';
    if (normalized.includes('lua')) return 'lua';
    if (normalized.includes('haskell')) return 'haskell';
    
    return 'plaintext';
  }

  /** Parse consoleOutput as JSON if possible, otherwise return null */
  get parsedOutput(): any {
    if (!this.consoleOutput) return null;
    try {
      return JSON.parse(this.consoleOutput);
    } catch {
      return null;
    }
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
    }
  }
  get isSubmitResult(): boolean {
  const p = this.parsedOutput;
  return p && typeof p.status === 'string' && p.passed !== undefined;
}

}