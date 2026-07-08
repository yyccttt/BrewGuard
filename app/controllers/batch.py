from app.core.crud import CRUDBase
from app.models.batch import Batch
from app.schemas.batchs import BatchCreate, BatchUpdate


class BatchController(CRUDBase[Batch, BatchCreate, BatchUpdate]):
    def __init__(self):
        super().__init__(model=Batch)


batch_controller = BatchController()
