import { supabase } from '../lib/supabase';

/**
 * Checks for items in the trash that have been deleted for more than 30 days
 * and permanently removes them from both the database and storage.
 */
export const cleanupOldTrashItems = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateThreshold = thirtyDaysAgo.toISOString();

        // 1. Find items to delete
        const { data: itemsToDelete, error: fetchError } = await supabase
            .from('photos')
            .select('id, storage_path, deleted_at')
            .lt('deleted_at', dateThreshold)
            .not('deleted_at', 'is', null);

        if (fetchError) throw fetchError;

        if (!itemsToDelete || itemsToDelete.length === 0) {
            return; // Nothing to clean up
        }

        console.log(`[AutoCleanup] Found ${itemsToDelete.length} items older than 30 days. Cleaning up...`);

        // 2. Extract storage paths
        const pathsToDelete = itemsToDelete
            .map(p => p.storage_path)
            .filter(path => path !== null && path !== '') as string[];

        // 3. Delete files from Storage
        if (pathsToDelete.length > 0) {
            const { error: storageError } = await supabase.storage
                .from('photos')
                .remove(pathsToDelete);

            if (storageError) {
                console.error('[AutoCleanup] Error deleting files from storage:', storageError);
            }
        }

        // 4. Delete records from Database
        const idsToDelete = itemsToDelete.map(p => p.id);
        const { error: dbError } = await supabase
            .from('photos')
            .delete()
            .in('id', idsToDelete);

        if (dbError) throw dbError;

        console.log('[AutoCleanup] Cleanup complete.');

    } catch (error) {
        console.error('[AutoCleanup] Failed to cleanup old trash items:', error);
    }
};
