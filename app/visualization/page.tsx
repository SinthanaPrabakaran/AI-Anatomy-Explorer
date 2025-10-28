"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    THREE: any
  }
}

export default function VisualizationPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelLoadedRef = useRef(false)

  useEffect(() => {
    if (modelLoadedRef.current || !containerRef.current) return

    const loadThree = async () => {
      try {
        // Dynamically import Three.js
        const THREE = await import("three")
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js")
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js")

        // Scene setup
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x0a0a0a)

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
        camera.position.set(0, 1.5, 3)

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        containerRef.current?.appendChild(renderer.domElement)

        // Lighting
        const light = new THREE.DirectionalLight(0xffffff, 2)
        light.position.set(2, 2, 5)
        scene.add(light)
        scene.add(new THREE.AmbientLight(0xffffff, 1.0))

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true

        // Organ selector
        const organInput = document.createElement("input")
        organInput.id = "organ-selector"
        organInput.type = "text"
        organInput.placeholder = "Enter organ (e.g., heart, kidney, brain, lungs, liver)"
        organInput.style.cssText = `
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 8px 12px;
          border: 1px solid #22d3ee;
          border-radius: 8px;
          background: rgba(0,0,0,0.7);
          color: white;
          font-size: 14px;
          z-index: 100;
          width: 200px;
        `
        document.body.appendChild(organInput)

        // Sidebar for label info
        const sidebar = document.createElement("div")
        sidebar.style.cssText = `
          position: absolute;
          top: 70px;
          right: 20px;
          width: 280px;
          padding: 16px;
          background: rgba(0,0,0,0.8);
          border: 1px solid rgba(34,211,238,0.3);
          border-radius: 12px;
          color: white;
          font-family: system-ui, sans-serif;
          z-index: 100;
        `
        sidebar.innerHTML = `<h3 style="color: #22d3ee; margin: 0 0 8px 0;">Click a label</h3><p style="margin: 0; color: #a3a3a3;">Select any label to learn more.</p>`
        document.body.appendChild(sidebar)

        let currentModel: any = null
        let currentLabelGroup: any = null

        const organConfig = {
          heart: {
            model: "/3d_labelling/models/heart.glb",
            labels: "/3d_labelling/output/heart_labels.json",
          },
          kidney: {
            model: "/3d_labelling/models/kidney.glb",
            labels: "/3d_labelling/output/kidney_labels.json",
          },
          brain: {
            model: "/3d_labelling/models/brain.glb",
            labels: null, // No labels file yet
          },
          lungs: {
            model: "/3d_labelling/models/lungs2.glb",
            labels: null, // No labels file yet
          },
          liver: {
            model: "/3d_labelling/models/liver3.glb",
            labels: null, // No labels file yet
          },
        }

        function frameCameraToObject(object: any) {
          const box = new THREE.Box3().setFromObject(object)
          const size = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())

          const maxSize = Math.max(size.x, size.y, size.z)
          const fitHeightDistance = maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360))
          const fitWidthDistance = fitHeightDistance / camera.aspect
          const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance)

          const direction = new THREE.Vector3(0, 0, 1)
          camera.position.copy(center).add(direction.multiplyScalar(distance))
          controls.target.copy(center)
          camera.near = Math.max(distance / 100, 0.01)
          camera.far = distance * 100
          camera.updateProjectionMatrix()
          controls.update()
        }

        function addLabels(scene: any, labels: any[]) {
          const labelGroup = new THREE.Group()

          labels.forEach((label: any) => {
            const anchor = new THREE.Vector3(label.position.x, label.position.y, label.position.z)

            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const padding = 3
            const fontSize = 14
            ctx.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`
            const text = label.name
            const textWidth = Math.ceil(ctx.measureText(text).width)
            canvas.width = textWidth + padding * 2
            canvas.height = fontSize + padding * 2

            const ctx2 = canvas.getContext("2d")
            if (!ctx2) return
            ctx2.font = `600 ${fontSize}px Segoe UI, Arial, sans-serif`
            ctx2.fillStyle = "rgba(0,0,0,0.55)"
            ctx2.fillRect(0, 0, canvas.width, canvas.height)
            ctx2.fillStyle = "#ffd7d7"
            ctx2.fillText(text, padding, padding + fontSize - 4)

            const texture = new THREE.CanvasTexture(canvas)
            const material = new THREE.SpriteMaterial({
              map: texture,
              transparent: true,
              depthTest: true,
            })
            const sprite = new THREE.Sprite(material)

            const direction = anchor.clone().normalize()
            const offsetDistance = 0.15
            const labelPos = anchor.clone().add(direction.multiplyScalar(offsetDistance))
            sprite.position.copy(labelPos)

            const heightWorldUnits = 0.06
            sprite.scale.set((canvas.width / canvas.height) * heightWorldUnits, heightWorldUnits, 1)

            const points = [anchor, labelPos]
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const lineMaterial = new THREE.LineBasicMaterial({
              color: 0xffd7d7,
              transparent: true,
              opacity: 0.7,
            })
            const line = new THREE.Line(geometry, lineMaterial)

            scene.add(line)
            sprite.userData = label
            labelGroup.add(sprite)
          })

          scene.add(labelGroup)
          return labelGroup
        }

        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        window.addEventListener("click", (event) => {
          if (!currentLabelGroup?.children) return

          mouse.x = (event.clientX / window.innerWidth) * 2 - 1
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
          raycaster.setFromCamera(mouse, camera)

          const intersects = raycaster.intersectObjects(currentLabelGroup.children)
          if (intersects.length > 0) {
            const clicked = intersects[0].object.userData
            sidebar.innerHTML = `
              <h3 style="color: #22d3ee; margin: 0 0 8px 0;">${clicked.name}</h3>
              <p style="margin: 0; color: #e5e5e5;">${clicked.short_description}</p>
            `
          }
        })

        async function loadOrgan(organType: keyof typeof organConfig) {
          const config = organConfig[organType]
          if (!config) return

          if (currentModel) {
            scene.remove(currentModel)
            currentModel = null
          }

          if (currentLabelGroup) {
            scene.remove(currentLabelGroup)
            const lines = scene.children.filter((child: any) => child.type === "Line")
            lines.forEach((line: any) => scene.remove(line))
            currentLabelGroup = null
          }

          const loader = new GLTFLoader()
          loader.load(
            config.model,
            (gltf) => {
              const model = gltf.scene
              currentModel = model
              scene.add(model)
              frameCameraToObject(model)

              if (config.labels) {
                fetch(config.labels)
                  .then((res) => res.json())
                  .then((labels) => {
                    currentLabelGroup = addLabels(scene, labels)
                  })
                  .catch((err) => {
                    console.error("Failed to load labels:", err)
                    sidebar.innerHTML = `<p style="color: #ef4444;">Failed to load labels</p>`
                  })
              } else {
                sidebar.innerHTML = `<h3 style="color: #22d3ee; margin: 0 0 8px 0;">${organType.charAt(0).toUpperCase() + organType.slice(1)}</h3><p style="margin: 0; color: #a3a3a3;">Model loaded successfully. No labels available yet.</p>`
              }
            },
            undefined,
            (err) => {
              console.error("Failed to load model:", err)
              sidebar.innerHTML = `<p style="color: #ef4444;">Failed to load model</p>`
            }
          )
        }

        organInput.addEventListener("keydown", (e: any) => {
          if (e.key === "Enter") {
            const inputValue = e.target.value.toLowerCase().trim()
            if (inputValue === "heart" || inputValue === "kidney" || inputValue === "brain" || inputValue === "lungs" || inputValue === "liver") {
              loadOrgan(inputValue)
            }
          }
        })


        function animate() {
          requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()

        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener("resize", handleResize)

        modelLoadedRef.current = true

        return () => {
          window.removeEventListener("resize", handleResize)
          if (organInput.parentNode) organInput.remove()
          if (sidebar.parentNode) sidebar.remove()
        }
      } catch (error) {
        console.error("Failed to load Three.js:", error)
      }
    }

    loadThree()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      <div id="visualization-container" ref={containerRef} className="w-full h-screen" />
    </main>
  )
}

