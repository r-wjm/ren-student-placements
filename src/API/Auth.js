import pb from './PocketBase';

let hasLoggedIn = false;

export const login = async (username, password) => {
    try {
        await pb.collection('users').authWithPassword(username, password);
        const userId = getUserId();
        return {
            isValid: isAuthenticated(),
            token: getToken(),
            userId: userId,
        };
    } catch (err) {
        console.error('Login error:', err); 
        throw new Error('Login failed: ' + err.message);
    }
};

export const logout = async () => {
    pb.authStore.clear();
    console.log('User logged out successfully');
};

export const isAuthenticated = () => {
    return pb.authStore.isValid;
};

export const getToken = () => {
    return pb.authStore.token;
};

export const getUserId = () => {
    const user = pb.authStore.model;
    if (!user) {
        throw new Error('No user is logged in');
    }
    
    if (!hasLoggedIn) {
        console.log(user.username + " has logged in.");
        hasLoggedIn = true;
    }
    return user.id;
};

export const getUserDetails = () => {
    const user = pb.authStore.model;
    if (!user) {
        throw new Error('No user is logged in');
    }

    const { id: userId, username, role, establishment } = user;
    return { userId, username, role, establishment };
};

export const updatePlacement = async (recordId, data) => {
    try {
        const response = await pb.collection('placement').update(recordId, data);
        console.log('Placement updated successfully:', response);
        return response;
    } catch (err) {
        console.error('Failed to update placement:', err.message);
        throw new Error('Failed to update placement: ' + err.message);
    }
};

export const deletePlacement = async (recordId) => {
    try {
        await pb.collection('placement').delete(recordId);
        console.log('Placement deleted successfully');
    } catch (err) {
        console.error('Failed to delete placement:', err.message);
        throw new Error('Failed to delete placement: ' + err.message);
    }
};

export const createPlacement = async (data) => {
    try {
        const response = await pb.collection('placement').create(data);
        console.log('Placement created successfully:', response);
        return response;
    } catch (err) {
        console.error('Failed to create placement:', err.message);
        throw new Error('Failed to create placement: ' + err.message);
    }
};

export const fetchPlacements = async () => {
    const controller = new AbortController(); 
    const signal = controller.signal;

    try {
        const user = pb.authStore.model;
        if (!user) {
            console.error('User is not logged in, cannot fetch placements.');
            throw new Error('User is not logged in');
        }

        const records = await pb.collection('placement').getList(1, 50, {
            expand: 'owner', 
            signal: signal,  
        });

        console.log('Fetched placements:', records.items);

        const placementsWithOwners = records.items.map((placement) => {
            const ownerId = placement.owner ? placement.owner.id : null;
            const ownerEstablishment = placement.owner ? placement.owner.establishment : null;

            console.log('Placement:', placement);
            console.log('Owner ID:', ownerId);
            console.log('Owner Establishment:', ownerEstablishment);

            return {
                ...placement,
                ownerId,
                ownerEstablishment
            };
        });

        return placementsWithOwners; 
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch request was aborted');
        } else {
            console.error('Error fetching placements:', error.message); 
            throw error;
        }
    }
};

export const resetPassword = async (userEmail) => {
    try {
        console.log("Password reset requested for:", userEmail);
        await pb.admins.requestPasswordReset(userEmail);
    } catch (err) {
        console.error("Password reset request failed:", err.message);
        throw new Error('Password reset request failed: ' + err.message);
    }
};
