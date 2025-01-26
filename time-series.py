import sys
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_squared_error
import pickle

def generate_forecast(user_id, transactions, model):
    # Step 1: Convert transactions to a csv
    data['Transaction Date'] = pd.to_datetime(data['Transaction Date'], format='%m/%d/%Y', errors='coerce')

    # Drop rows with invalid dates (if any)
    data = data.dropna(subset=['Transaction Date'])
    # Group by week and sum 'Amount' for weekly data
    df_grouped_daily = data.groupby(data['Transaction Date'].dt.to_period('D')).agg({'Amount (USD)': 'sum'}).reset_index()

    # Convert 'Date' column to datetime for further processing
    df_grouped_daily['Transaction Date'] = df_grouped_daily['Transaction Date'].dt.to_timestamp()

    #  Set the 'Date' column as the index
    df_grouped_daily.set_index('Transaction Date', inplace=True)
    

    # Calculate Q1, Q3, and IQR for the 'Amount' column
    Q1 = df_grouped_daily['Amount (USD)'].quantile(0.25)
    Q3 = df_grouped_daily['Amount (USD)'].quantile(0.75)
    IQR = Q3 - Q1

    # Define the bounds for outliers
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    # Identify outliers
    outliers = df_grouped_daily[(df_grouped_daily['Amount (USD)'] < lower_bound) | (df_grouped_daily['Amount (USD)'] > upper_bound)]

    print("Outliers detected:")
    print(outliers)

    # Remove the outliers from the dataset
    df_no_outliers = df_grouped_daily[(df_grouped_daily['Amount (USD)'] >= lower_bound) & (df_grouped_daily['Amount (USD)'] <= upper_bound)]

    # Optionally, you can reset the index after removing the outliers
    df_no_outliers.reset_index(inplace=True)

    print(f"Original dataset size: {len(df_grouped_daily)}")
    print(f"Dataset size after removing outliers: {len(df_no_outliers)}")


    # Ensure the DataFrame is sorted by Date
    df_no_outliers.sort_index(inplace=True)

    # Define the split point
    split_point = int(len(df_no_outliers) * 0.8)  # 80% train, 20% test
    train_data = df_no_outliers.iloc[:split_point]
    test_data = df_no_outliers.iloc[split_point:]


    results = model.fit()

    # Forecast for the test period
    forecast = results.get_forecast(steps=len(test_data))
    forecast_ci = forecast.conf_int()

    # Plot training, test, and forecast data
    plt.figure(figsize=(10, 6))
    plt.plot(train_data.index, train_data['Amount (USD)'], label='Train')
    #plt.plot(test_data.index, test_data['Amount (USD)'], label='Test')
    plt.plot(test_data.index, forecast.predicted_mean, label='Forecast')
    plt.fill_between(test_data.index,
                    forecast_ci.iloc[:, 0],
                    forecast_ci.iloc[:, 1],
                    color='pink', alpha=0.3)
    plt.legend()
    plt.title('Forecasting')
    plt.xlabel('Date')
    plt.ylabel('Amount (USD)')

    image_path = 'prediction_graph.png'
    plt.savefig(image_path)

    return image_path

if __name__ == "__main__":
    # Get user_id and transactions from the command-line arguments
    user_id = sys.argv[1]
    transactions_json = sys.argv[2]  # Transactions passed as a JSON string
    
    # Convert the transactions JSON string into a Python list
    transactions = json.loads(transactions_json)
    
    # Step 1: Load the pre-trained SARIMAX model from the pickle file
    model_path = 'sarimax_model.pkl'  # Replace with your actual model path
    with open(model_path, 'rb') as file:
        model = pickle.load(file)
    
    # Step 2: Generate the forecast and save the plot
    forecast_image_path = generate_forecast(user_id, transactions, model)
    
    # Output the path of the generated forecast image as JSON
    print(json.dumps({"forecast_image_path": forecast_image_path}))


    