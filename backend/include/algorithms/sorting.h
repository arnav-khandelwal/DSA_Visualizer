#ifndef SORTING_H
#define SORTING_H

#include <vector>
#include <string>
#include <sstream>

// Helper function to convert array to JSON string
std::string arrayToJson(const std::vector<int>& arr, int highlightPos = -1, int highlightPos2 = -1) {
    std::ostringstream json;
    json << "[";
    for (size_t i = 0; i < arr.size(); ++i) {
        if (i > 0) json << ",";
        
        if (i == highlightPos || i == highlightPos2) {
            json << "{\"value\":" << arr[i] << ",\"highlight\":true}";
        } else {
            json << "{\"value\":" << arr[i] << ",\"highlight\":false}";
        }
    }
    json << "]";
    return json.str();
}

// Bubble Sort with steps
std::vector<std::string> bubbleSort(std::vector<int> arr) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back(arrayToJson(arr));
    
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            // Highlight current comparison elements
            steps.push_back(arrayToJson(arr, j, j+1));
            
            if (arr[j] > arr[j+1]) {
                std::swap(arr[j], arr[j+1]);
                // Add the state after swap
                steps.push_back(arrayToJson(arr, j, j+1));
            }
        }
    }
    
    // Add final state
    steps.push_back(arrayToJson(arr));
    
    return steps;
}

// Insertion Sort with steps
std::vector<std::string> insertionSort(std::vector<int> arr) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back(arrayToJson(arr));
    
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        // Highlight the key element
        steps.push_back(arrayToJson(arr, i));
        
        while (j >= 0 && arr[j] > key) {
            // Highlight comparison
            steps.push_back(arrayToJson(arr, j, i));
            
            arr[j + 1] = arr[j];
            j--;
            
            // Show the movement
            steps.push_back(arrayToJson(arr, j+1));
        }
        arr[j + 1] = key;
        
        // Show insertion of key
        steps.push_back(arrayToJson(arr, j+1));
    }
    
    // Add final state
    steps.push_back(arrayToJson(arr));
    
    return steps;
}

// Selection Sort with steps
std::vector<std::string> selectionSort(std::vector<int> arr) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back(arrayToJson(arr));
    
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        int min_idx = i;
        
        // Highlight current position
        steps.push_back(arrayToJson(arr, i));
        
        for (int j = i+1; j < n; j++) {
            // Highlight comparison
            steps.push_back(arrayToJson(arr, min_idx, j));
            
            if (arr[j] < arr[min_idx])
                min_idx = j;
        }
        
        // Highlight min element found
        steps.push_back(arrayToJson(arr, i, min_idx));
        
        std::swap(arr[min_idx], arr[i]);
        
        // Show after swap
        steps.push_back(arrayToJson(arr, i));
    }
    
    // Add final state
    steps.push_back(arrayToJson(arr));
    
    return steps;
}

// Merge two subarrays and track steps
void merge(std::vector<int>& arr, int left, int mid, int right, std::vector<std::string>& steps) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    // Create temp arrays
    std::vector<int> L(n1), R(n2);
    
    // Copy data to temp arrays
    for (int i = 0; i < n1; i++)
        L[i] = arr[left + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[mid + 1 + j];
    
    // Merge the temp arrays back into arr[left..right]
    int i = 0; // Initial index of first subarray
    int j = 0; // Initial index of second subarray
    int k = left; // Initial index of merged subarray
    
    while (i < n1 && j < n2) {
        // Highlight the comparison elements
        std::vector<int> tempArr = arr;
        steps.push_back(arrayToJson(arr, left + i, mid + 1 + j));
        
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
        
        // Show the array after placement
        steps.push_back(arrayToJson(arr, k - 1));
    }
    
    // Copy the remaining elements of L[]
    while (i < n1) {
        arr[k] = L[i];
        steps.push_back(arrayToJson(arr, k));
        i++;
        k++;
    }
    
    // Copy the remaining elements of R[]
    while (j < n2) {
        arr[k] = R[j];
        steps.push_back(arrayToJson(arr, k));
        j++;
        k++;
    }
}

// Merge sort with steps
void mergeSortHelper(std::vector<int>& arr, int left, int right, std::vector<std::string>& steps) {
    if (left < right) {
        // Same as (left + right) / 2, but avoids overflow for large left and right
        int mid = left + (right - left) / 2;
        
        // Highlight the divide step
        steps.push_back(arrayToJson(arr, left, right));
        
        // Sort first and second halves
        mergeSortHelper(arr, left, mid, steps);
        mergeSortHelper(arr, mid + 1, right, steps);
        
        // Highlight before merge
        steps.push_back(arrayToJson(arr, left, right));
        
        // Merge the sorted halves
        merge(arr, left, mid, right, steps);
    }
}

// Merge Sort wrapper function
std::vector<std::string> mergeSort(std::vector<int> arr) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back(arrayToJson(arr));
    
    // Call the recursive helper function
    mergeSortHelper(arr, 0, arr.size() - 1, steps);
    
    // Add final state
    steps.push_back(arrayToJson(arr));
    
    return steps;
}

// Partition function for Quick Sort
int partition(std::vector<int>& arr, int low, int high, std::vector<std::string>& steps) {
    int pivot = arr[high]; // pivot
    int i = (low - 1); // Index of smaller element
    
    // Highlight pivot
    steps.push_back(arrayToJson(arr, high));
    
    for (int j = low; j <= high - 1; j++) {
        // Highlight current element being compared
        steps.push_back(arrayToJson(arr, j, high));
        
        // If current element is smaller than the pivot
        if (arr[j] < pivot) {
            i++; // increment index of smaller element
            std::swap(arr[i], arr[j]);
            
            // Show after swap
            steps.push_back(arrayToJson(arr, i, j));
        }
    }
    
    // Swap pivot into its final position
    std::swap(arr[i + 1], arr[high]);
    
    // Show after pivot placement
    steps.push_back(arrayToJson(arr, i + 1));
    
    return (i + 1);
}

// Quick sort helper
void quickSortHelper(std::vector<int>& arr, int low, int high, std::vector<std::string>& steps) {
    if (low < high) {
        // Highlight current partition
        steps.push_back(arrayToJson(arr, low, high));
        
        // pi is partitioning index
        int pi = partition(arr, low, high, steps);
        
        // Separately sort elements before and after partition
        quickSortHelper(arr, low, pi - 1, steps);
        quickSortHelper(arr, pi + 1, high, steps);
    }
}

// Quick Sort wrapper function
std::vector<std::string> quickSort(std::vector<int> arr) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back(arrayToJson(arr));
    
    // Call the recursive helper function
    quickSortHelper(arr, 0, arr.size() - 1, steps);
    
    // Add final state
    steps.push_back(arrayToJson(arr));
    
    return steps;
}

// Heapify a subtree rooted at index i
void heapify(std::vector<int>& arr, int n, int i, std::vector<std::string>& steps) {
    int largest = i; // Initialize largest as root
    int left = 2 * i + 1; // left = 2*i + 1
    int right = 2 * i + 2; // right = 2*i + 2
    
    // Highlight current root
    steps.push_back(arrayToJson(arr, i));
    
    // If left child is larger than root
    if (left < n && arr[left] > arr[largest]) {
        steps.push_back(arrayToJson(arr, left, largest));
        largest = left;
    }
    
    // If right child is larger than largest so far
    if (right < n && arr[right] > arr[largest]) {
        steps.push_back(arrayToJson(arr, right, largest));
        largest = right;
    }
    
    // If largest is not root
    if (largest != i) {
        steps.push_back(arrayToJson(arr, i, largest));
        std::swap(arr[i], arr[largest]);
        
        // Show after swap
        steps.push_back(arrayToJson(arr, i, largest));
        
        // Recursively heapify the affected sub-tree
        heapify(arr, n, largest, steps);
    }
}

// Heap Sort function
std::vector<std::string> heapSort(std::vector<int> arr) {
    std::vector<std::string> steps;
    
    // Add initial state
    steps.push_back(arrayToJson(arr));
    
    int n = arr.size();
    
    // Build heap (rearrange array)
    for (int i = n / 2 - 1; i >= 0; i--) {
        steps.push_back(arrayToJson(arr, i));
        heapify(arr, n, i, steps);
    }
    
    // Add state after heap is built
    steps.push_back(arrayToJson(arr));
    
    // One by one extract an element from heap
    for (int i = n - 1; i > 0; i--) {
        // Move current root to end
        steps.push_back(arrayToJson(arr, 0, i));
        std::swap(arr[0], arr[i]);
        
        // Show after swap
        steps.push_back(arrayToJson(arr, i));
        
        // Call max heapify on the reduced heap
        heapify(arr, i, 0, steps);
    }
    
    // Add final state
    steps.push_back(arrayToJson(arr));
    
    return steps;
}

#endif // SORTING_H