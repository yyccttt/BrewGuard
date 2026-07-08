from app.core.crud import CRUDBase
from app.models.detection import Detection
from app.schemas.detections import DetectionCreate, DetectionUpdate


class DetectionController(CRUDBase[Detection, DetectionCreate, DetectionUpdate]):
    def __init__(self):
        super().__init__(model=Detection)


detection_controller = DetectionController()
