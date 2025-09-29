// Import the firebase app instance to interact with Firestore.
import { db } from './firebase'; // Load the Firestore database instance from firebase.js in the same directory.
import { collection, getDocs, query, where, documentId } from 'firebase/firestore'; // Import necessary Firestore functions for database operations.


// Asynchronous function to read posts from Firestore.
async function readPostsJson(onlyIds = false) { // Defines an asynchronous function `readPostsJson` that can optionally fetch only post IDs.
    const collectionRef = collection(db, "posts"); // Get a reference to the "posts" collection in the Firestore database.
    const querySnapshot = await getDocs(collectionRef); // Execute the query to get all documents in the "posts" collection.
    let jsonObj = {}; // Initialize an empty object to store the processed JSON data.
    if (onlyIds) { // Check if only IDs are requested.
        jsonObj = querySnapshot.docs.map(doc => ({ id: doc.id })); // If `onlyIds` is true, map documents to an array of objects containing only the document ID.
    } else { // If full post data is requested.
        jsonObj = querySnapshot.docs.map(doc => Object.assign({ id: doc.id }, doc.data())); // Map documents to an array of objects, including ID and all document data.
    }

    return jsonObj; // Return the processed JSON object/array.
}

// Function to get all posts data, sorted by title.
export async function getSortedPostsData() { // Defines an asynchronous function to fetch and sort all blog post data.
    const jsonObj = await readPostsJson(); // Call `readPostsJson` to get all post data from Firestore.
    // Sort the posts alphabetically by their title.
    jsonObj.sort(function (a, b) { // Sort the array of post objects.
        // Use 'localeCompare' for proper string comparison.
        return a.title.localeCompare(b.title); // Compare titles of two posts for sorting.
    });
    // Map over the sorted objects to return a consistent structure for each post.
    return jsonObj.map(item => { // Map the sorted array to format each post for consistent output.
        return { // Return a new object for each post with specific properties.
            // Convert id to string, ensuring consistency.
            id: item.id.toString(), // Convert the post ID to a string.
            // Include the post title.
            title: item.title, // Include the post title.
            // Include the post date.
            date: item.date, // Include the post date.
            // Include the post author.
            author: item.author, // Include the post author.
        }
    });
}

// Function to get all post IDs for dynamic routing.
export async function getAllPostIds() { // Defines an asynchronous function to get all post IDs for Next.js dynamic routing.
    // Read the raw JSON post data.
    const jsonObj = await readPostsJson(true); // Call `readPostsJson` to get only post IDs from Firestore.
    // Map over the posts to return an array of objects with 'params.id'.
    return jsonObj.map(item => { // Map the array of post IDs to the format expected by Next.js.
        return { // Return an object with `params` property.
            params: { // The `params` object contains the `id` for dynamic routing.
                // Convert id to string as expected by Next.js dynamic routes.
                id: item.id.toString() // Convert the post ID to a string for the `id` parameter.
            }
        }
    });
}

// Function to get data for a single post by its ID.
export async function getPostData(id) { // Defines an asynchronous function to get data for a single post by its ID.
    const collectionRef = collection(db, "posts"); // Get a reference to the "posts" collection.
    const searchQuery = query( // Create a query to find a specific document.
        collectionRef, // Specify the collection to query.
        where( // Apply a filter to the query.
            documentId(), // Specify that the filter is on the document ID.
            "==", // The comparison operator (equals).
            id, // The ID to match against.
        )
    );
    const querySnapshot = await getDocs(searchQuery); // Execute the query to get the document snapshot.
    const jsonObj = querySnapshot.docs.map(doc => Object.assign({ id: doc.id }, doc.data())); // Map the document snapshot to an object containing the ID and data.

    // Check if a post was found.
    if (jsonObj.length === 0) { // If no document was returned by the query.
        // If no post is found, return a 'Not found' object.
        return { // Return a default "Not found" object.
            id: id, // The requested ID.
            title: 'Not found', // A default title indicating the post was not found.
            date: '', // Empty date.
            contentHtml: 'Not found' // Empty content HTML.
        }
    } else { // If a document was found.
        // If a post is found, return the first (and should be only) matching object.
        return jsonObj[0]; // Return the first matching post object (assuming IDs are unique).
    }
}