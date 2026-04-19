from pydantic import BaseModel
from typing import Dict, Any

class CustomSimulationData(BaseModel):
    sensors: Dict[str, float]
