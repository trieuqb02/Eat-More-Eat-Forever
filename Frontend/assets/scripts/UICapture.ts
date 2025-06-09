import {
  _decorator,
  Camera,
  Component,
  director,
  Node,
  RenderTexture,
  Sprite,
  UITransform,
} from "cc";

const { ccclass, property } = _decorator;

@ccclass("UICapture")
export class UICapture extends Component {
  async captureUINode(targetNode: Node): Promise<RenderTexture | null> {
    const uiTransform = targetNode.getComponent(UITransform);
    if (!uiTransform) return null;

    const renderTexture = new RenderTexture();
    renderTexture.reset({
      width: uiTransform.contentSize.width,
      height: uiTransform.contentSize.height,
    });

    const cameraNode = new Node("TempCamera");
    const camera = cameraNode.addComponent(Camera);
    camera.projection = Camera.ProjectionType.ORTHO;
    camera.orthoHeight = uiTransform.contentSize.height / 2;
    camera.targetTexture = renderTexture;
    camera.enabled = true;

    camera.visibility = targetNode.layer;

    cameraNode.setParent(director.getScene());
    const worldPos = targetNode.getWorldPosition();
    cameraNode.setWorldPosition(worldPos.x, worldPos.y, worldPos.z + 600);

    return new Promise((resolve) => {
      this.scheduleOnce(() => {
        camera.targetTexture = null;
        cameraNode.destroy();
        resolve(renderTexture);
      }, 0.1);
    });
  }

  renderTextureToBase64(renderTexture: RenderTexture): string | null {
    const width = renderTexture.width;
    const height = renderTexture.height;
    const pixels = renderTexture.readPixels();

    if (!pixels) {
      console.error("Không đọc được pixel từ RenderTexture.");
      return null;
    }

    // Tạo canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Không tạo được context 2D.");
      return null;
    }

    // Cocos trả pixel dạng RGBA, ngược chiều Y => cần đảo ngược hàng
    const imageData = ctx.createImageData(width, height);
    const rowBytes = width * 4;

    for (let y = 0; y < height; y++) {
      const srcOffset = (height - y - 1) * rowBytes; // đảo chiều Y
      const destOffset = y * rowBytes;
      imageData.data.set(
        pixels.subarray(srcOffset, srcOffset + rowBytes),
        destOffset
      );
    }

    ctx.putImageData(imageData, 0, 0);

    // Trả về Base64 PNG
    return canvas.toDataURL("image/png");
  }
}
