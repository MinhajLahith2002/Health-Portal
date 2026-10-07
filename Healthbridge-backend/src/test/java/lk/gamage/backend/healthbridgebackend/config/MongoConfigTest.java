package lk.gamage.backend.healthbridgebackend.config;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertTrue;

class MongoConfigTest {

    @Test
    void exposesGridFsTemplateAsSpringBean() throws NoSuchMethodException {
        Method gridFsTemplate = MongoConfig.class.getDeclaredMethod(
                "gridFsTemplate",
                org.springframework.data.mongodb.MongoDatabaseFactory.class,
                org.springframework.data.mongodb.core.convert.MongoConverter.class);

        assertTrue(gridFsTemplate.isAnnotationPresent(Bean.class));
    }
}