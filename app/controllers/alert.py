from app.core.crud import CRUDBase
from app.models.alerts import Alert
from app.schemas.alerts import AlertCreate, AlertUpdate


class AlertController(CRUDBase[Alert, AlertCreate, AlertUpdate]):
    def __init__(self):
        super().__init__(model=Alert)


alert_controller = AlertController()
