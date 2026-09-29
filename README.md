# Smart Crop Protection (AI + IoT)

Flow: `Website -> Flask API -> Keras model -> prediction -> DB -> Website`. The notebook trains once; the backend only loads `trained_model.keras`.

## 1. Train the model (PlantVillage, Mendeley)
1. Download the dataset from Mendeley, unzip it into `ai_model/dataset/` so it contains one folder per class (e.g. `Tomato___Late_blight/`). If there is an extra wrapper folder, edit `DATA_DIR` in the notebook's first cell.
2. `pip install -r requirements.txt jupyter matplotlib scikit-learn`
3. `cd ai_model && jupyter notebook training.ipynb`, run all cells. A GPU (or Google Colab) is strongly recommended.
4. It writes `trained_model.keras` and `class_names.json` into `ai_model/`. Class folders must be named `Crop___Disease` (PlantVillage default) and healthy classes must contain "healthy".

## 2. Database
Quick start: skip this; the backend falls back to SQLite (`crop.db`).
PostgreSQL: `docker compose up -d`, then copy `.env.example` to `.env` and export those variables (`export $(cat .env | xargs)`).

## 3. Backend
```
cd backend && python app.py      # http://localhost:5000, GET /api/health shows model_loaded
```
## 4. Frontend
```
cd frontend && npm install && npm run dev     # http://localhost:5173
```
Camera needs HTTPS or localhost. On a phone, serve over HTTPS or use the upload option.

## 5. IoT
Edit Wi-Fi, server IP, `DEVICE_KEY`, `PLANT_ID` in `iot/esp32_code/esp32_code.ino`. Wiring in `iot/sensor_configuration/wiring.md`. Transport is REST (MQTT not included).

## API (JWT via `Authorization: Bearer <token>` except IoT and login/register)
| Method | Path | Purpose |
|---|---|---|
| POST | /api/auth/register, /api/auth/login, /api/auth/forgot-password | Accounts (forgot-password is a stub, no email sent) |
| GET/POST | /api/plants | List (with latest prediction + sensors) / create |
| GET | /api/plants/{id} | Plant + health forecast |
| POST | /api/predict (alias /api/upload) | multipart `image`, `plant_id` -> disease, confidence, damage, severity, health score |
| GET | /api/results/{id}, /api/predictions/{plant_id}, /api/sensors/{plant_id} | History |
| POST | /api/iot/sensor-data | Header `X-Device-Key`; JSON plant_id, temperature, humidity, soil_moisture, light_intensity |
| GET | /api/alerts; POST /api/alerts/{id}/resolve | Alerts |

## Testing
```
curl -X POST localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"A","email":"a@b.com","password":"secret1"}'
curl -X POST localhost:5000/api/plants -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d '{"plant_name":"P-101","crop_type":"Tomato","location":"Field A"}'
curl -X POST localhost:5000/api/predict -H "Authorization: Bearer $T" -F image=@leaf.jpg -F plant_id=1
```
## Notes and limits
- Damage % is a colour-segmentation estimate (share of leaf that is not green), not a measurement. It works best on a single leaf on a plain background.
- PlantVillage photos are lab-style; accuracy on field photos will be lower. Add your own field images to the dataset for better results.
- Lifespan is a trend-based range from past health scores, shown with a confidence level; it needs 3+ checks.
- Recommendations are general inspection and monitoring steps, with no pesticide advice.
- Change `JWT_SECRET` and `DEVICE_KEY` before deploying.
