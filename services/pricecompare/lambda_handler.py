# Adapter for AWS Lambda using Mangum
from mangum import Mangum
from main import app

handler = Mangum(app)