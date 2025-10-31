import httpx
from config import settings
from schemas import WeatherData
from typing import Optional, Tuple
from datetime import datetime


class WeatherService:
    
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = settings.OPENWEATHER_BASE_URL
    
    async def get_weather_by_location(self, location: str) -> Optional[WeatherData]:
        
        if not self.api_key:
            print("Warning: OPENWEATHER_API_KEY not configured")
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "q": location,
                    "appid": self.api_key,
                    "units": "metric"  # Celsius
                }
                response = await client.get(self.base_url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                
                return WeatherData(
                    temperature=data["main"]["temp"],
                    humidity=data["main"]["humidity"],
                    condition=data["weather"][0]["main"],  # "Rain", "Clear", "Clouds"
                    description=data["weather"][0]["description"],
                    wind_speed=data["wind"]["speed"]
                )
        except Exception as e:
            print(f"Error fetching weather for {location}: {str(e)}")
            return None
    
    async def get_weather_by_coords(self, lat: float, lon: float) -> Optional[WeatherData]:
       
        if not self.api_key:
            print("Warning: OPENWEATHER_API_KEY not configured")
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric"
                }
                response = await client.get(self.base_url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                
                return WeatherData(
                    temperature=data["main"]["temp"],
                    humidity=data["main"]["humidity"],
                    condition=data["weather"][0]["main"],
                    description=data["weather"][0]["description"],
                    wind_speed=data["wind"]["speed"]
                )
        except Exception as e:
            print(f"Error fetching weather for coords ({lat}, {lon}): {str(e)}")
            return None
    
    def generate_crop_suggestion(
        self, 
        crop_name: str, 
        weather: WeatherData,
        growth_stage: str
    ) -> Tuple[str, str]:
       
        crop_lower = crop_name.lower()
        condition = weather.condition.lower()
        temp = weather.temperature
        humidity = weather.humidity
        wind = weather.wind_speed
        
        # Temperature thresholds
        very_hot = temp > 35
        hot = temp > 30
        cold = temp < 10
        very_cold = temp < 5
        
        # Humidity thresholds
        high_humidity = humidity > 80
        low_humidity = humidity < 30
        
        # Wind thresholds
        strong_wind = wind > 10  # m/s
        
        # Crop-specific logic
        
        # PADDY / RICE
        if "paddy" in crop_lower or "rice" in crop_lower:
            if condition == "rain":
                return ("🌧️ Rain expected — avoid irrigation today. Good for water-intensive rice cultivation.", "info")
            elif very_hot and low_humidity:
                return ("☀️ Very hot and dry — ensure consistent water levels in paddy fields.", "warning")
            elif high_humidity and temp > 25:
                return ("🌡️ High humidity and warm — monitor for blast disease. Consider preventive fungicide.", "warning")
            elif growth_stage == "flowering" and temp < 20:
                return ("❄️ Temperature too low during flowering — may affect grain formation.", "alert")
            else:
                return (f"🌾 Weather is favorable for paddy. Temperature: {temp}°C, Humidity: {humidity}%", "info")
        
        # TOMATO
        elif "tomato" in crop_lower:
            if condition == "rain" and high_humidity:
                return ("🌧️ Rain and high humidity — high risk of fungal diseases. Apply preventive fungicide.", "alert")
            elif high_humidity:
                return ("🌡️ High humidity detected — apply preventive fungicide to avoid blight.", "warning")
            elif very_hot:
                return ("☀️ Very hot weather — provide shade and increase irrigation frequency.", "warning")
            elif strong_wind and growth_stage in ["seedling", "vegetative"]:
                return ("💨 Strong winds — stake and support young tomato plants to prevent damage.", "warning")
            elif cold:
                return ("❄️ Cold temperature — protect plants from frost, use row covers if needed.", "alert")
            else:
                return (f"🍅 Weather is suitable for tomatoes. Temperature: {temp}°C, Humidity: {humidity}%", "info")
        
        # COTTON
        elif "cotton" in crop_lower:
            if strong_wind and growth_stage in ["seedling", "vegetative"]:
                return ("💨 Strong winds detected — support young cotton plants to prevent lodging.", "warning")
            elif condition == "rain" and growth_stage == "flowering":
                return ("🌧️ Rain during flowering — may cause flower drop. Monitor closely.", "warning")
            elif very_hot and low_humidity:
                return ("☀️ Hot and dry conditions — ideal for cotton but monitor for water stress.", "info")
            elif high_humidity and temp > 25:
                return ("🌡️ Humid conditions — watch for bollworm and other pests.", "warning")
            elif cold:
                return ("❄️ Cold weather — cotton growth may slow down. Protect if frost is expected.", "warning")
            else:
                return (f"🌱 Weather conditions are acceptable for cotton. Temperature: {temp}°C", "info")
        
        # WHEAT
        elif "wheat" in crop_lower:
            if condition == "rain" and growth_stage == "harvest":
                return ("🌧️ Rain before harvest — delay harvesting to avoid grain damage and mold.", "alert")
            elif very_hot and growth_stage == "flowering":
                return ("☀️ High temperature during flowering — may reduce grain yield.", "warning")
            elif cold and growth_stage == "vegetative":
                return ("❄️ Cold weather — wheat can tolerate it, but monitor for frost damage.", "info")
            elif high_humidity:
                return ("🌡️ High humidity — watch for rust and other fungal diseases.", "warning")
            else:
                return (f"🌾 Weather is suitable for wheat. Temperature: {temp}°C", "info")
        
        # CORN / MAIZE
        elif "corn" in crop_lower or "maize" in crop_lower:
            if condition == "rain" and growth_stage == "seedling":
                return ("🌧️ Heavy rain — ensure proper drainage to prevent waterlogging.", "warning")
            elif very_hot and low_humidity:
                return ("☀️ Very hot and dry — increase irrigation, especially during tasseling.", "warning")
            elif strong_wind and growth_stage in ["vegetative", "flowering"]:
                return ("💨 Strong winds — may cause lodging. Hill up soil around plants for support.", "warning")
            elif high_humidity and temp > 25:
                return ("🌡️ Humid conditions — monitor for corn borer and other pests.", "warning")
            else:
                return (f"🌽 Weather is favorable for corn. Temperature: {temp}°C", "info")
        
        # POTATO
        elif "potato" in crop_lower:
            if high_humidity and temp > 20:
                return ("🌡️ High humidity — late blight risk is high. Apply fungicide preventively.", "alert")
            elif very_hot:
                return ("☀️ Very hot weather — tuber development may be affected. Ensure adequate moisture.", "warning")
            elif cold and growth_stage == "seedling":
                return ("❄️ Cold weather — frost can damage potato plants. Protect if needed.", "warning")
            elif condition == "rain":
                return ("🌧️ Rainy weather — ensure good drainage to prevent tuber rot.", "info")
            else:
                return (f"🥔 Weather is suitable for potatoes. Temperature: {temp}°C", "info")
        
        # ONION
        elif "onion" in crop_lower:
            if condition == "rain" and growth_stage == "bulbing":
                return ("🌧️ Rain during bulbing — may reduce storage quality. Ensure proper drainage.", "warning")
            elif high_humidity:
                return ("🌡️ High humidity — risk of fungal diseases. Apply preventive measures.", "warning")
            elif very_hot and low_humidity:
                return ("☀️ Hot and dry — ideal for onion bulb development. Maintain steady moisture.", "info")
            else:
                return (f"🧅 Weather is acceptable for onions. Temperature: {temp}°C", "info")
        
        # Generic crop advice
        else:
            if condition == "rain":
                return (f"🌧️ Rain expected — adjust irrigation for {crop_name} accordingly.", "info")
            elif very_hot:
                return (f"☀️ Very hot weather — ensure {crop_name} has adequate water and shade if needed.", "warning")
            elif cold:
                return (f"❄️ Cold temperature — protect {crop_name} from frost if sensitive.", "warning")
            elif high_humidity:
                return (f"🌡️ High humidity — monitor {crop_name} for fungal diseases.", "warning")
            elif strong_wind:
                return (f"💨 Strong winds — provide support to {crop_name} plants if needed.", "warning")
            else:
                return (f"✅ Weather conditions are suitable for {crop_name}. Temperature: {temp}°C, Humidity: {humidity}%", "info")


# Create a singleton instance
weather_service = WeatherService()
