# 2D Convolution Visualizer

Este repositorio contiene una aplicación interactiva que **visualiza cómo funcionan las convoluciones en 2D** sobre imágenes.  
Permite:
- Subir una imagen y reducirla automáticamente a **64×64 píxeles**.
- Configurar **tamaño del kernel**, **stride** y **padding**.
- Ver paso a paso cómo se aplica la convolución, resaltando el área del kernel y mostrando el resultado en la salida **pixel por pixel**.
- Explorar diferentes **kernels predefinidos** o personalizarlos.
- Observar el resultado final en un grid de salida, junto con los valores intermedios.

---

## 🚀 Creado con GitHub Spark

Todo el código de este repositorio fue **generado al 100% usando [GitHub Spark](https://github.com/features/spark?locale=es-419)**, aprovechando su capacidad para transformar ideas en proyectos completos sin escribir código manualmente.

---

## 📦 Despliegue automático con GitHub Copilot

El flujo de **build y publicación en GitHub Pages** fue configurado con ayuda de **GitHub Copilot**.  
El resultado se puede ver en vivo aquí:  
🔗 **[Demo en GitHub Pages](https://joelibaceta.github.io/2d-convolution-visua/)**

La sesión exacta donde el agente configuró el despliegue está registrada en:  
🔗 **[Sesión del agente en PR #7](https://github.com/joelibaceta/2d-convolution-visua/pull/7/agent-sessions/b7c1a515-f51f-4ab9-8119-41f06f6e13b6)**

---

## 📂 Estructura principal
```
src/
components/       # Componentes UI (grids, controles, inspector de kernel)
lib/              # Lógica matemática y utilidades puras
App.tsx           # Punto de entrada principal
index.css         # Estilos globales (Tailwind)
index.html
```

---

## 🛠️ Cómo ejecutarlo localmente

```bash
# Clonar el repositorio
git clone https://github.com/joelibaceta/2d-convolution-visua.git
cd 2d-convolution-visua

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```


