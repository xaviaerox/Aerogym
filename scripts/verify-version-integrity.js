import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Ejecutando VERSION INTEGRITY CHECK...');

let errors = [];
let warnings = [];

// 1. Leer package.json (Fuente canónica)
const pkgPath = path.join(rootDir, 'package.json');
if (!fs.existsSync(pkgPath)) {
  errors.push('CRÍTICO: No se encontró package.json');
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const canonicalVersion = pkg.version;
console.log(`📌 Fuente técnica canónica (package.json): v${canonicalVersion}`);

if (!canonicalVersion) {
  errors.push('CRÍTICO: package.json no define la propiedad "version"');
}

// 2. Verificar PROJECT_CONTEXT.md
const contextPath = path.join(rootDir, 'PROJECT_CONTEXT.md');
if (fs.existsSync(contextPath)) {
  const contextContent = fs.readFileSync(contextPath, 'utf8');
  if (!contextContent.includes(`v${canonicalVersion}`) && !contextContent.includes(canonicalVersion)) {
    errors.push(`INCONSISTENCIA: PROJECT_CONTEXT.md no hace referencia a la versión v${canonicalVersion}`);
  } else {
    console.log(`✓ PROJECT_CONTEXT.md está alineado con v${canonicalVersion}`);
  }
} else {
  warnings.push('PROJECT_CONTEXT.md no existe');
}

// 3. Verificar CHANGELOG.md
const changelogPath = path.join(rootDir, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');
  if (!changelogContent.includes(`[${canonicalVersion}`)) {
    errors.push(`INCONSISTENCIA: CHANGELOG.md no incluye una sección para la versión [${canonicalVersion}]`);
  } else {
    console.log(`✓ CHANGELOG.md contiene la entrada [${canonicalVersion}]`);
  }

  // Verificar monotonía de SemVer en las secciones del changelog
  const versionHeaderRegex = /^##\s*\[(\d+\.\d+\.\d+)[^\]]*\]/gm;
  let match;
  const versionsFound = [];
  while ((match = versionHeaderRegex.exec(changelogContent)) !== null) {
    versionsFound.push(match[1]);
  }

  const parseSemver = (v) => v.split('.').map(Number);
  const isLowerOrEqual = (v1, v2) => {
    const [ma1, mi1, pa1] = parseSemver(v1);
    const [ma2, mi2, pa2] = parseSemver(v2);
    if (ma1 !== ma2) return ma1 <= ma2;
    if (mi1 !== mi2) return mi1 <= mi2;
    return pa1 <= pa2;
  };

  for (let i = 0; i < versionsFound.length - 1; i++) {
    const current = versionsFound[i];
    const previous = versionsFound[i + 1];
    if (isLowerOrEqual(current, previous)) {
      errors.push(`REGRESIÓN O ANOMALÍA EN CHANGELOG: Versión [${current}] aparece antes que [${previous}]`);
    }
  }
} else {
  warnings.push('CHANGELOG.md no existe');
}

// 4. Verificar src/config.ts (SSOT dinámica)
const configPath = path.join(rootDir, 'src', 'config.ts');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (!configContent.includes('packageJson.version') && !configContent.includes('import packageJson')) {
    errors.push('INCONSISTENCIA: src/config.ts no importa la versión dinámicamente de package.json');
  } else {
    console.log('✓ src/config.ts importa la versión dinámicamente desde package.json');
  }
}

// 5. Verificar PWA / vite.config.ts
const viteConfigPath = path.join(rootDir, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
  if (!viteContent.includes('VitePWA')) {
    warnings.push('VitePWA plugin no detectado en vite.config.ts');
  } else if (!viteContent.includes('cleanupOutdatedCaches: true')) {
    warnings.push('PWA cache control: cleanupOutdatedCaches no está activado');
  } else {
    console.log('✓ vite.config.ts tiene la estrategia PWA y gestión de cachés configurada');
  }
}

// Resumen final
console.log('\n--- RESULTADO DE VERIFICACIÓN DE VERSIONADO ---');
if (warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:');
  warnings.forEach((w) => console.log(`   - ${w}`));
}

if (errors.length > 0) {
  console.error('\n❌ ERROR DE INTEGRIDAD DE VERSIONADO DETECTADO:');
  errors.forEach((e) => console.error(`   - ${e}`));
  process.exit(1);
}

console.log('✅ VERSION INTEGRITY CHECK COMPLETADO CON ÉXITO — Todas las fuentes están alineadas.\n');
