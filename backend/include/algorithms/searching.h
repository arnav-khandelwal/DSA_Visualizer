#ifndef SEARCHING_H
#define SEARCHING_H

#include <vector>
#include <string>
#include <sstream>

// Helper function to convert search state to JSON
std::string searchStateToJson(const std::vector<int>& arr, int pos, const std::string& status) {
    std::ostringstream json;
    json << "{\"array\":[";
    for (size_t i = 0; i < arr.size(); ++i) {
        if (i > 0) json << ",";
        
        if (i == pos) {
            json << "{\"value\":" << arr[i] << ",\"highlight\":true}";
        } else {
            json << "{\"value\":" << arr[i] << ",\"highlight\":false}";
        }
    }
    json << "],\"status\":\"" << status << "\"}";
    return json.str();
}

// Linear Search with visualization steps
int linearSearch(const std::vector<int>& arr, int target, std::vector<std::string>& steps) {
    for (int i = 0; i < arr.size(); i++) {
        // Add current position to steps
        steps.push_back(searchStateToJson(arr, i, "Checking element at index " + std::to_string(i)));
        
        if (arr[i] == target) {
            steps.push_back(searchStateToJson(arr, i, "Found target at index " + std::to_string(i)));
            return i;
        }
    }
    
    steps.push_back(searchStateToJson(arr, -1, "Target not found in array"));
    return -1;
}

// Binary Search with visualization steps
int binarySearch(const std::vector<int>& arr, int target, std::vector<std::string>& steps) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        // Add current state to steps
        steps.push_back(searchStateToJson(arr, mid, "Checking mid element at index " + std::to_string(mid)));
        
        if (arr[mid] == target) {
            steps.push_back(searchStateToJson(arr, mid, "Found target at index " + std::to_string(mid)));
            return mid;
        }
        
        if (arr[mid] < target) {
            steps.push_back(searchStateToJson(arr, mid, "Target is greater, moving to right half"));
            left = mid + 1;
        } else {
            steps.push_back(searchStateToJson(arr, mid, "Target is smaller, moving to left half"));
            right = mid - 1;
        }
    }
    
    steps.push_back(searchStateToJson(arr, -1, "Target not found in array"));
    return -1;
}

#endif // SEARCHING_H