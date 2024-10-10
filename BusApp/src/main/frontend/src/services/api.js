const BASE_URL = 'https://apis.openapi.sk.com/transit/routes'; // API URL

export const getTransitRoutes = async (startX, startY, endX, endY, appKey) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'appKey': '2E98KPZpX52m9sP7J4ES574buetOtyM38Kzwap9K', // 발급 받은 appKey를 여기에 넣어주세요.
      },
      body: JSON.stringify({
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // 에러를 throw하여 호출한 곳에서 처리하도록 함
  }
};
